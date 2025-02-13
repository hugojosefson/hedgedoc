/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule, Routes } from 'nest-router';

import { PrivateApiModule } from '../src/api/private/private-api.module';
import { PublicApiModule } from '../src/api/public/public-api.module';
import { AuthModule } from '../src/auth/auth.module';
import { MockAuthGuard } from '../src/auth/mock-auth.guard';
import { TokenAuthGuard } from '../src/auth/token.strategy';
import { AuthorsModule } from '../src/authors/authors.module';
import { AuthConfig } from '../src/config/auth.config';
import appConfigMock from '../src/config/mock/app.config.mock';
import authConfigMock from '../src/config/mock/auth.config.mock';
import customizationConfigMock from '../src/config/mock/customization.config.mock';
import externalServicesConfigMock from '../src/config/mock/external-services.config.mock';
import mediaConfigMock from '../src/config/mock/media.config.mock';
import { FrontendConfigModule } from '../src/frontend-config/frontend-config.module';
import { GroupsModule } from '../src/groups/groups.module';
import { HistoryModule } from '../src/history/history.module';
import { HistoryService } from '../src/history/history.service';
import { IdentityModule } from '../src/identity/identity.module';
import { IdentityService } from '../src/identity/identity.service';
import { ConsoleLoggerService } from '../src/logger/console-logger.service';
import { LoggerModule } from '../src/logger/logger.module';
import { MediaModule } from '../src/media/media.module';
import { MediaService } from '../src/media/media.service';
import { MonitoringModule } from '../src/monitoring/monitoring.module';
import { AliasService } from '../src/notes/alias.service';
import { NotesModule } from '../src/notes/notes.module';
import { NotesService } from '../src/notes/notes.service';
import { PermissionsModule } from '../src/permissions/permissions.module';
import { RevisionsModule } from '../src/revisions/revisions.module';
import { UsersModule } from '../src/users/users.module';
import { UsersService } from '../src/users/users.service';
import { setupSessionMiddleware } from '../src/utils/session';
import { setupValidationPipe } from '../src/utils/setup-pipes';

export class TestSetup {
  moduleRef: TestingModule;
  app: NestExpressApplication;

  userService: UsersService;
  configService: ConfigService;
  identityService: IdentityService;
  notesService: NotesService;
  mediaService: MediaService;
  historyService: HistoryService;
  aliasService: AliasService;

  public static async create(): Promise<TestSetup> {
    const testSetup = new TestSetup();
    const routes: Routes = [
      {
        path: '/api/v2',
        module: PublicApiModule,
      },
      {
        path: '/api/private',
        module: PrivateApiModule,
      },
    ];

    testSetup.moduleRef = await Test.createTestingModule({
      imports: [
        RouterModule.forRoutes(routes),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          autoLoadEntities: true,
          synchronize: true,
          dropSchema: true,
        }),
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            appConfigMock,
            authConfigMock,
            mediaConfigMock,
            customizationConfigMock,
            externalServicesConfigMock,
          ],
        }),
        NotesModule,
        UsersModule,
        RevisionsModule,
        AuthorsModule,
        PublicApiModule,
        PrivateApiModule,
        HistoryModule,
        MonitoringModule,
        PermissionsModule,
        GroupsModule,
        LoggerModule,
        MediaModule,
        AuthModule,
        FrontendConfigModule,
        IdentityModule,
      ],
    })
      .overrideGuard(TokenAuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    testSetup.userService = testSetup.moduleRef.get<UsersService>(UsersService);
    testSetup.configService =
      testSetup.moduleRef.get<ConfigService>(ConfigService);
    testSetup.identityService =
      testSetup.moduleRef.get<IdentityService>(IdentityService);
    testSetup.notesService =
      testSetup.moduleRef.get<NotesService>(NotesService);
    testSetup.mediaService =
      testSetup.moduleRef.get<MediaService>(MediaService);
    testSetup.historyService =
      testSetup.moduleRef.get<HistoryService>(HistoryService);
    testSetup.aliasService =
      testSetup.moduleRef.get<AliasService>(AliasService);

    testSetup.app = testSetup.moduleRef.createNestApplication();

    setupSessionMiddleware(
      testSetup.app,
      testSetup.configService.get<AuthConfig>('authConfig'),
    );

    return testSetup;
  }
}
