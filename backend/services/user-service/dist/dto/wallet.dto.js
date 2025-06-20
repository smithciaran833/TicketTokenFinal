"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletBalanceDto = exports.MigrateWalletDto = exports.ConnectPhantomDto = exports.CreateWalletDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateWalletDto {
}
exports.CreateWalletDto = CreateWalletDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWalletDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateWalletDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['CUSTODIAL', 'PHANTOM'] }),
    (0, class_validator_1.IsEnum)(['CUSTODIAL', 'PHANTOM']),
    __metadata("design:type", String)
], CreateWalletDto.prototype, "walletType", void 0);
class ConnectPhantomDto {
}
exports.ConnectPhantomDto = ConnectPhantomDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConnectPhantomDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConnectPhantomDto.prototype, "phantomPublicKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConnectPhantomDto.prototype, "phantomWallet", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConnectPhantomDto.prototype, "signature", void 0);
class MigrateWalletDto {
}
exports.MigrateWalletDto = MigrateWalletDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MigrateWalletDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MigrateWalletDto.prototype, "targetWallet", void 0);
class WalletBalanceDto {
}
exports.WalletBalanceDto = WalletBalanceDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], WalletBalanceDto.prototype, "balance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], WalletBalanceDto.prototype, "walletAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], WalletBalanceDto.prototype, "formatted", void 0);
//# sourceMappingURL=wallet.dto.js.map