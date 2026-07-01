-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `nivelAcesso` INTEGER NOT NULL DEFAULT 1,
    `ultimoLogin` DATETIME(3) NULL,

    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Carro` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `modelo` VARCHAR(191) NOT NULL,
    `marca` VARCHAR(191) NOT NULL,
    `placa` VARCHAR(191) NOT NULL,
    `donoId` INTEGER NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Carro_placa_key`(`placa`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `acao` VARCHAR(191) NOT NULL,
    `dataHora` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usuarioId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Carro` ADD CONSTRAINT `Carro_donoId_fkey` FOREIGN KEY (`donoId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Log` ADD CONSTRAINT `Log_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
