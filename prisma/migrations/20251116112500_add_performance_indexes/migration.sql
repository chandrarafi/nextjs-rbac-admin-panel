-- CreateIndex
CREATE INDEX `Icon_isActive_idx` ON `Icon`(`isActive`);

-- CreateIndex
CREATE INDEX `Icon_name_idx` ON `Icon`(`name`);

-- CreateIndex
CREATE INDEX `Menu_isActive_idx` ON `Menu`(`isActive`);

-- CreateIndex
CREATE INDEX `Menu_title_idx` ON `Menu`(`title`);

-- CreateIndex
CREATE INDEX `Permission_module_idx` ON `Permission`(`module`);

-- CreateIndex
CREATE INDEX `Permission_name_idx` ON `Permission`(`name`);

-- CreateIndex
CREATE INDEX `Role_name_idx` ON `Role`(`name`);

-- CreateIndex
CREATE INDEX `Role_isActive_idx` ON `Role`(`isActive`);

-- CreateIndex
CREATE INDEX `User_email_idx` ON `User`(`email`);

-- CreateIndex
CREATE INDEX `User_createdAt_idx` ON `User`(`createdAt`);
