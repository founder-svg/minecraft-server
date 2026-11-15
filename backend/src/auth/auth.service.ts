import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const res = await this.db.query(
      'SELECT id, username, email, password_hash, role, is_active FROM admin_users WHERE username = $1',
      [username],
    );
    if (res.rows.length === 0) return null;

    const user = res.rows[0];
    if (!user.is_active) return null;

    const match = await bcrypt.compare(pass, user.password_hash);
    if (match) {
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    await this.db.query('UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    // Finding 7: Short-lived access token (15m) + secure refresh token (7d)
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: '7d' },
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 900, // 15 minutes
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      if (decoded.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const res = await this.db.query(
        'SELECT id, username, email, role, is_active FROM admin_users WHERE id = $1',
        [decoded.sub],
      );
      if (res.rows.length === 0 || !res.rows[0].is_active) {
        throw new UnauthorizedException('User account no longer active');
      }

      const user = res.rows[0];
      const newAccessToken = this.jwtService.sign(
        { username: user.username, sub: user.id, role: user.role },
        { expiresIn: '15m' },
      );

      return {
        access_token: newAccessToken,
        expires_in: 900,
      };
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }
  }
}
