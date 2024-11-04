import { Module } from '@nestjs/common';
import { appIntervalImports } from './app/imports/internal.imports';
import { appPluginImports } from './app/imports/plugins.import';

@Module({
  imports: [...appPluginImports, ...appIntervalImports],
})
export class AppModule {}
