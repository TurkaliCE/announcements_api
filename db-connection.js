const mongoose = require('mongoose');
require('dotenv').config();

const connectWithRetry = () => {
    mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000, // Bağlantı kurma süresi (5 saniye)
        socketTimeoutMS: 45000, // Bağlantı zaman aşımı (45 saniye)
        maxPoolSize: 10, // Maksimum bağlantı havuzu boyutu
    }).then(() => {
        console.log('MongoDB bağlantısı başarılı');
    }).catch(err => {
        console.error('MongoDB bağlantısı başarısız, tekrar denenecek...', err);
        setTimeout(connectWithRetry, 5000); // 5 saniye sonra tekrar dene
    });
};

connectWithRetry();

const db = mongoose.connection;

db.on('error', err => {
    console.error('MongoDB bağlantı hatası:', err);
});

db.on('disconnected', () => {
    console.warn('MongoDB bağlantısı koptu! Yeniden bağlanılıyor...');
    setTimeout(connectWithRetry, 5000); // Bağlantı kesildiğinde yeniden dene
});

db.on('reconnected', () => {
    console.log('MongoDB yeniden bağlandı!');
});

setInterval(async () => {
    try {
        await mongoose.connection.db.admin().ping();
        console.log('MongoDB bağlantısı aktif');
    } catch (err) {
        console.error('MongoDB bağlantı kontrolü başarısız:', err);
    }
}, 60000); // Her 60 saniyede bir kontrol et
