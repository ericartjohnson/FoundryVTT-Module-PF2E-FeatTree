export class FeatData {
    constructor({uuid, displayName, imageUrl, level, isActive}){
        this.uuid = uuid;
        this.displayName = displayName;
        this.imageUrl = imageUrl;
        this.level = level;
        this.isActive = !!isActive;
    }

    get id() {
        return this.uuid.split('.')[this.uuid.split('.').length - 1];
    }
}