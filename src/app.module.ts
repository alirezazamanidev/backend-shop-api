import { Module } from '@nestjs/common';
import { appIntervalImports } from './app/imports/internal.imports';
import { appPluginImports } from './app/imports/plugins.import';
import { TypeOrmConfigService } from './app/plugins/typeOrm-config.service';
import { CategoryModule } from './modules/category/category.module';

@Module({
  imports: [...appPluginImports, ...appIntervalImports, CategoryModule],
  providers:[TypeOrmConfigService]
})
export class AppModule {}
