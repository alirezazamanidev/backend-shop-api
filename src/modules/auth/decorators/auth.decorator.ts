import { applyDecorators, UseGuards } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { ApiSecurity } from "@nestjs/swagger"


export const UserAuth=()=>{

    return applyDecorators(
        ApiSecurity('authorization'),
        UseGuards(AuthGuard('jwt'))
    )
}