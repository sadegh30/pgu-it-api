import { Request } from 'express';
import { SafeUser } from '../../common/utils/sanitize-user';

export interface RequestWithUser extends Request {
  user: SafeUser;
}
