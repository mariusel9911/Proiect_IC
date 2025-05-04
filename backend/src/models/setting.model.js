// models/setting.model.js
import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    siteTitle: {
        type: String,
        default: 'Clingo Admin'
    },
    siteDescription: {
        type: String,
        default: 'Admin dashboard for service management'
    }
}, { timestamps: true });

// Static method to get or create settings
settingSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

const Setting = mongoose.model('Setting', settingSchema);

export default Setting;