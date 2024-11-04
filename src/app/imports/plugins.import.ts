import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmConfigService } from "../plugins/typeOrm-config.service";


export const appPluginImports=[
    TypeOrmModule.forRootAsync({
        useClass:TypeOrmConfigService,
        inject:[TypeOrmConfigService]
    })
]