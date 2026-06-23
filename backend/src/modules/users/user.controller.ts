// src/modules/users/user.controller.ts
import { Request, Response } from 'express';
import { UserService } from './user.service';
import { asyncHandler } from '../../middleware/asyncHandler';
import { ApiResponseHelper } from '../../shared/utils/response';
import { UserRole } from '../../shared/constants/enums';

export class UserController {
  private service = new UserService();

  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.list({
      search: req.query.search as string,
      role: req.query.role as UserRole | undefined,
      is_active:
        req.query.is_active === undefined
          ? undefined
          : req.query.is_active === 'true',
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    });
    ApiResponseHelper.success(res, result.data, undefined, 200, result.meta);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.service.getById(req.params.id);
    ApiResponseHelper.success(res, user);
  });

  updateRole = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.service.updateRole(req.params.id, req.body.role, req.userId!);
    ApiResponseHelper.success(res, user, 'نقش کاربر بروزرسانی شد');
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.service.updateStatus(req.params.id, req.body.is_active, req.userId!);
    ApiResponseHelper.success(res, user, 'وضعیت کاربر بروزرسانی شد');
  });
}
