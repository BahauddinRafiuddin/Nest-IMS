import { Body, Controller, Post, UseGuards, Get, Query, Param, Patch } from '@nestjs/common';
import { TaskService } from './task.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { SubmitTaskDto } from './dto/submit-task.dto';
import { ReviewTaskDto } from './dto/review-task.dto';

@Controller('task')
@UseGuards(JwtAuthGuard, RolesGuard)

export class TaskController {
  constructor(private taskService: TaskService) { }

  // Mentor can create tasks
  @Post()
  @Roles("MENTOR")
  createTask(@Body() body: CreateTaskDto, @GetUser() user: any) {
    return this.taskService.createTask(body, user)
  }

  // Interns tasks
  @Get('my')
  @Roles("INTERN")
  getMyTasks(
    @GetUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 5;
    return this.taskService.getMyTasks(user, pageNumber, limitNumber, status)
  }

  // Intern can submit taks
  @Patch(':id/submit')
  @Roles("INTERN")
  submitTask(@Body() body: SubmitTaskDto, @GetUser() user: any, @Param('id') taskId: string) {
    return this.taskService.submitTask(body, user, taskId)
  }

  // Mentor can see his cretaed tasks
  @Get('/mentorTasks')
  @Roles("MENTOR")
  getMenotrTasks(@GetUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string
  ) {
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 5;
    return this.taskService.getMentorTasks(user, pageNumber, limitNumber, status)
  }

  // Mentor review taks
  @Patch('/:id/review')
  @Roles("MENTOR")
  reviewTask(@Body() body: ReviewTaskDto, @GetUser() user: any, @Param('id') id: string) {
    return this.taskService.reviewTask(body, user, id)
  }
}
