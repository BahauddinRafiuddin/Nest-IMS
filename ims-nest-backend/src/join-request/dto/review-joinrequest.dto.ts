import { JoinRequestStatus } from "@prisma/client";
import { IsEnum, IsNotEmpty } from "class-validator";


export class ReviewJoinrequestDto{

  @IsNotEmpty()
  @IsEnum(JoinRequestStatus)
  action!: JoinRequestStatus
}