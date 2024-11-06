import { Module } from '@nestjs/common';
import { appIntervalImports } from './app/imports/internal.imports';
import { appPluginImports } from './app/imports/plugins.import';
import { TypeOrmConfigService } from './app/plugins/typeOrm-config.service';


@Module({
  imports: [...appPluginImports, ...appIntervalImports],
  providers:[TypeOrmConfigService]
})
export class AppModule {}
