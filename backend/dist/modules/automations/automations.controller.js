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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const automations_service_1 = require("./automations.service");
const create_automation_dto_1 = require("./dto/create-automation.dto");
const update_automation_dto_1 = require("./dto/update-automation.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let AutomationsController = class AutomationsController {
    constructor(automationsService) {
        this.automationsService = automationsService;
    }
    create(createAutomationDto) {
        return this.automationsService.create(createAutomationDto);
    }
    findAll() {
        return this.automationsService.findAll();
    }
    findOne(id) {
        return this.automationsService.findOne(id);
    }
    update(id, updateAutomationDto) {
        return this.automationsService.update(id, updateAutomationDto);
    }
    remove(id) {
        return this.automationsService.remove(id);
    }
    toggleActive(id) {
        return this.automationsService.toggleActive(id);
    }
    executeNow(id) {
        return this.automationsService.executeNow(id);
    }
};
exports.AutomationsController = AutomationsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_automation_dto_1.CreateAutomationDto]),
    __metadata("design:returntype", void 0)
], AutomationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AutomationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AutomationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_automation_dto_1.UpdateAutomationDto]),
    __metadata("design:returntype", void 0)
], AutomationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AutomationsController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/toggle'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AutomationsController.prototype, "toggleActive", null);
__decorate([
    (0, common_1.Post)(':id/execute'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AutomationsController.prototype, "executeNow", null);
exports.AutomationsController = AutomationsController = __decorate([
    (0, swagger_1.ApiTags)('automations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/v1/automations'),
    __metadata("design:paramtypes", [automations_service_1.AutomationsService])
], AutomationsController);
//# sourceMappingURL=automations.controller.js.map