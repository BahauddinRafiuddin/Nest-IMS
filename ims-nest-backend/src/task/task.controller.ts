import { Body, Controller, Post, UseGuards, Get, Query, Param, Patch } from '@nestjs/common';
import { TaskService } from './task.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { SubmitTaskDto } from './dto/submit-task.dto';

@Controller('task')
@UseGuards(JwtAuthGuard, RolesGuard)

export class TaskController {
  constructor(private taskService: TaskService) { }

  @Post()
  @Roles("MENTOR")
  createTask(@Body() body: CreateTaskDto, @GetUser() user: any) {
    return this.taskService.createTask(body, user)
  }

  @Get('my')
  @Roles("INTERN")
  getMyTasks(
    @GetUser() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 5,
    @Query('status') status?: string,
  ) {
    return this.taskService.getMyTasks(user,Number(page), Number(limit), status)
  }

  @Patch(':id/submit')
  @Roles("INTERN")
  submitTask(@Body() body:SubmitTaskDto,@GetUser() user:any,@Param('id') taskId:string){
    return this.taskService.submitTask(body,user,taskId)
  }
}
