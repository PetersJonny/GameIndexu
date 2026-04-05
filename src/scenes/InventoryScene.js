export class InventoryScene {
    constructor(engine) {
        this.engine = engine;
        this.width = 900;
        this.height = 700;
        this.x = (1280 - this.width) / 2;
        this.y = (720 - this.height) / 2;

        this.portraitBox = { x: this.x + 30, y: this.y + 90, width: 220, height: 260 };
        this.grid = {
            cols: 4,
            rows: 4,
            slotSize: 64,
            gap: 24,
            x: this.x + 280,
            y: this.y + 90
        };

        const equipmentY = this.grid.y + this.grid.rows * (this.grid.slotSize + this.grid.gap) + 26;
        this.equipmentSlots = [
            { key: 'weapon', label: 'Arma', x: this.grid.x, y: equipmentY, width: 160, height: 160 },
            { key: 'armor', label: 'Armadura', x: this.grid.x + 180, y: equipmentY, width: 160, height: 160 },
            { key: 'relic', label: 'Relíquia', x: this.grid.x + 360, y: equipmentY, width: 160, height: 160 }
        ];

        this.portraitImage = null;
        this.portraitImageLoaded = false;
        this.portraitImagePath = null;
    }

    draw(ctx) {
        // Fundo escuro e janela centralizada
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, this.engine.canvas.width, this.engine.canvas.height);

        ctx.fillStyle = '#161820';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '26px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Inventário', this.x + 24, this.y + 36);
        ctx.font = '16px Arial';
        ctx.fillText(`Fragmentos: ${this.engine.memoryFragments}`, this.x + 24, this.y + 62);
        ctx.fillText('Pressione ESC para fechar.', this.x + 24, this.y + 84);

        // Frame do portrait
        ctx.fillStyle = '#22222D';
        ctx.fillRect(this.portraitBox.x, this.portraitBox.y, this.portraitBox.width, this.portraitBox.height);
        ctx.strokeStyle = '#FFFFFF';
        ctx.strokeRect(this.portraitBox.x, this.portraitBox.y, this.portraitBox.width, this.portraitBox.height);

        this.updatePortraitImage();

        if (this.portraitImageLoaded && this.portraitImage) {
            ctx.drawImage(
                this.portraitImage,
                this.portraitBox.x,
                this.portraitBox.y,
                this.portraitBox.width,
                this.portraitBox.height
            );
        } else {
            ctx.fillStyle = this.engine.selectedCharacter?.color || '#444';
            ctx.fillRect(this.portraitBox.x, this.portraitBox.y, this.portraitBox.width, this.portraitBox.height);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                this.engine.selectedCharacter?.name ? this.engine.selectedCharacter.name.split(' ')[0] : '???',
                this.portraitBox.x + this.portraitBox.width / 2,
                this.portraitBox.y + this.portraitBox.height / 2
            );
            ctx.textAlign = 'left';
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '18px Arial';
        const heroName = this.engine.selectedCharacter?.name || 'Desconhecido';
        const heroClass = this.engine.selectedCharacter?.class || 'Sem classe';
        ctx.textAlign = 'center';
        ctx.fillText(heroName, this.portraitBox.x + this.portraitBox.width / 2, this.portraitBox.y + this.portraitBox.height + 30);
        ctx.font = '14px Arial';
        ctx.fillText(heroClass, this.portraitBox.x + this.portraitBox.width / 2, this.portraitBox.y + this.portraitBox.height + 54);
        ctx.textAlign = 'left';

        // Grade de itens
        for (let row = 0; row < this.grid.rows; row += 1) {
            for (let col = 0; col < this.grid.cols; col += 1) {
                const slotX = this.grid.x + col * (this.grid.slotSize + this.grid.gap);
                const slotY = this.grid.y + row * (this.grid.slotSize + this.grid.gap);
                const slotIndex = row * this.grid.cols + col;
                const item = this.engine.inventory[slotIndex];

                ctx.fillStyle = '#202035';
                ctx.fillRect(slotX, slotY, this.grid.slotSize, this.grid.slotSize);
                ctx.strokeStyle = '#555577';
                ctx.strokeRect(slotX, slotY, this.grid.slotSize, this.grid.slotSize);

                if (item) {
                    ctx.fillStyle = '#8D9EFF';
                    ctx.fillRect(slotX + 4, slotY + 4, this.grid.slotSize - 8, this.grid.slotSize - 8);
                    ctx.fillStyle = '#000000';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.font = 'bold 12px Arial';
                    ctx.fillText(item.name, slotX + this.grid.slotSize / 2, slotY + 12, this.grid.slotSize - 12);
                    ctx.font = '11px Arial';
                    ctx.fillText(item.type.toUpperCase(), slotX + this.grid.slotSize / 2, slotY + 32, this.grid.slotSize - 12);
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'alphabetic';
                }
            }
        }

        // Slots de equipamento
        this.equipmentSlots.forEach((slot) => {
            ctx.fillStyle = '#202035';
            ctx.fillRect(slot.x, slot.y, slot.width, slot.height);
            ctx.strokeStyle = '#FFFFFF';
            ctx.strokeRect(slot.x, slot.y, slot.width, slot.height);
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 18px Arial';
            ctx.fillText(slot.label, slot.x + slot.width / 2, slot.y + 24);

            const equipped = this.engine.equipment[slot.key];
            if (equipped) {
                ctx.fillStyle = '#8D9EFF';
                ctx.fillRect(slot.x + 8, slot.y + 44, slot.width - 16, slot.height - 60);
                ctx.fillStyle = '#000000';
                ctx.textBaseline = 'top';
                ctx.font = 'bold 14px Arial';
                ctx.fillText(equipped.name, slot.x + slot.width / 2, slot.y + 50, slot.width - 24);
                ctx.font = '12px Arial';
                ctx.fillText(equipped.desc, slot.x + slot.width / 2, slot.y + 72, slot.width - 24);
            } else {
                ctx.fillStyle = '#AAAAAA';
                ctx.font = '14px Arial';
                ctx.fillText('vazio', slot.x + slot.width / 2, slot.y + slot.height / 2);
            }
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
        });

        // Texto de instruções
        ctx.fillStyle = '#CCCCCC';
        ctx.font = '14px Arial';
        ctx.fillText('Clique em um item de arma/armadura/relíquia para equipar.', this.x + 280, this.y + this.height - 24);
    }

    handleInput(mouseX, mouseY) {
        if (!this.isInsideWindow(mouseX, mouseY)) {
            this.engine.closeInventory();
            return;
        }

        const clickedGrid = this.getGridSlot(mouseX, mouseY);
        if (clickedGrid !== null) {
            this.handleGridClick(clickedGrid);
            return;
        }

        const clickedEquipment = this.getEquipmentSlot(mouseX, mouseY);
        if (clickedEquipment) {
            this.unequip(clickedEquipment.key);
        }
    }

    isInsideWindow(mouseX, mouseY) {
        return mouseX >= this.x && mouseX <= this.x + this.width && mouseY >= this.y && mouseY <= this.y + this.height;
    }

    getGridSlot(mouseX, mouseY) {
        for (let row = 0; row < this.grid.rows; row += 1) {
            for (let col = 0; col < this.grid.cols; col += 1) {
                const slotX = this.grid.x + col * (this.grid.slotSize + this.grid.gap);
                const slotY = this.grid.y + row * (this.grid.slotSize + this.grid.gap);
                if (mouseX >= slotX && mouseX <= slotX + this.grid.slotSize && mouseY >= slotY && mouseY <= slotY + this.grid.slotSize) {
                    return row * this.grid.cols + col;
                }
            }
        }
        return null;
    }

    getEquipmentSlot(mouseX, mouseY) {
        return this.equipmentSlots.find((slot) => {
            return mouseX >= slot.x && mouseX <= slot.x + slot.width && mouseY >= slot.y && mouseY <= slot.y + slot.height;
        });
    }

    updatePortraitImage() {
        const portraitPath = this.engine.selectedCharacter?.portrait;
        if (!portraitPath) {
            this.portraitImagePath = null;
            this.portraitImage = null;
            this.portraitImageLoaded = false;
            return;
        }

        if (this.portraitImagePath === portraitPath) {
            return;
        }

        this.portraitImagePath = portraitPath;
        this.portraitImageLoaded = false;
        this.portraitImage = new Image();
        this.portraitImage.onload = () => {
            this.portraitImageLoaded = true;
        };
        this.portraitImage.src = portraitPath;
    }

    handleGridClick(index) {
        const item = this.engine.inventory[index];
        if (!item) return;

        if (item.type === 'weapon' || item.type === 'armor' || item.type === 'relic') {
            this.equip(index);
        }
    }

    equip(index) {
        const item = this.engine.inventory[index];
        if (!item) return;

        const slotKey = item.type;
        const current = this.engine.equipment[slotKey];

        this.engine.equipment[slotKey] = item;
        this.engine.inventory[index] = current || null;
    }

    unequip(slotKey) {
        const item = this.engine.equipment[slotKey];
        if (!item) return;

        const emptyIndex = this.engine.inventory.findIndex((slot) => slot === null);
        if (emptyIndex === -1) return;

        this.engine.inventory[emptyIndex] = item;
        this.engine.equipment[slotKey] = null;
    }
}
