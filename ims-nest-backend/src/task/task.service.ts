import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { SubmitTaskDto } from './dto/submit-task.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) { }

  async createTask(data: CreateTaskDto, user: any) {

    const { programId, assignedInternId, deadline } = data
    const program = await this.prisma.internshipProgram.findUnique({
      where: { id: programId }
    })

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    if (program.mentorId !== user.userId) {
      throw new ForbiddenException('You are not assigned to this program');
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        internId_programId: {
          internId: assignedInternId,
          programId: programId
        }
      }
    });

    if (!enrollment) {
      throw new BadRequestException('Intern is not enrolled in this program');
    }

    const task = await this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        programId,
        mentorId: user.userId,
        assignedInternId,
        enrollmentId: enrollment.id,
        deadline: new Date(deadline),
        priority: data.priority || 'MEDIUM'
      }
    });

    return {
      message: 'Task created successfully',
      task
    };
  }

  async getMyTasks(user: any, page: number, limit: number, status?: string) {
    const skip = (page - 1) * limit

    const where: any = {
      assignedInternId: user.userId,
      enrollment: {
        status: {
          in: ['APPROVED', 'IN_PROGRESS', 'COMPLETED']
        }
      }
    }
    if (status) {
      where.status = status;
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        include: {
          program: {
            select: {
              id: true,
              title: true,
              domain: true,
            },
          },
          mentor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),

      this.prisma.task.count({ where }),
    ]);

    return {
      success: true,
      message: tasks.length
        ? 'Tasks fetched successfully'
        : 'No tasks found',
      tasks,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async submitTask(data: SubmitTaskDto, user: any, taskId: string) {

    // Find task + include enrollment
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        enrollment: true
      }
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    // Ownership check
    if (task.assignedInternId !== user.userId) {
      throw new ForbiddenException("You are not assigned to this task");
    }

    //  Enrollment status check (VERY IMPORTANT)
    if (!task.enrollment || task.enrollment.status !== 'IN_PROGRESS') {
      throw new ForbiddenException("Internship is not active");
    }

    //  Prevent submission after approval
    if (task.status === 'APPROVED') {
      throw new BadRequestException("Task already approved");
    }

    //  Attempt limit
    if (task.attempts >= 3) {
      throw new BadRequestException("Maximum attempts reached");
    }

    //  Validate at least one submission field
    if (!data.submissionText && !data.submissionLink && !data.submissionFile) {
      throw new BadRequestException("At least one submission field is required");
    }

    // Deadline check
    const now = new Date();
    const isLate = now > task.deadline;

    //  Update task
    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        submissionText: data.submissionText,
        submissionFile: data.submissionFile,
        submissionLink: data.submissionLink,
        submittedAt: now,
        status: 'SUBMITTED',
        reviewStatus: 'PENDING',
        attempts: {
          increment: 1
        },
        isLate,

        //  Reset review fields (VERY IMPORTANT)
        score: null,
        feedback: null,
        reviewedAt: null
      }
    });

    return {
      message: "Task submitted successfully",
      task: updatedTask
    };
  }
}
