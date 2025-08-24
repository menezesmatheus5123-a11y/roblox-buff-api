const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Lista de usuários com permissões especiais (criptografada)
const specialUsers = {
    // Hash do ID 19017521 usando SHA-256
    'a8f5f167f44f4964e6c998dee827110c': {
        level: 'premium',
        features: {
            enhancedCombat: true,
            reducedCooldowns: true,
            increasedRange: true,
            betterHitbox: true
        }
    },
    // Você pode adicionar outros hashes aqui para outros IDs
};

// Função para gerar hash do userId
function generateHash(userId) {
    return crypto.createHash('sha256').update(userId.toString()).digest('hex').substring(0, 32);
}

// Endpoint para validar usuário
app.post('/validate-user', (req, res) => {
    try {
        const { userId, gameId, timestamp } = req.body;
        
        if (!userId || !gameId || !timestamp) {
            return res.status(400).json({ 
                error: 'Missing required parameters',
                hasPermission: false 
            });
        }

        // Verificar se a requisição não é muito antiga (previne replay attacks)
        const currentTime = Date.now();
        const requestTime = parseInt(timestamp);
        const timeDiff = Math.abs(currentTime - requestTime);
        
        if (timeDiff > 300000) { // 5 minutos
            return res.status(401).json({ 
                error: 'Request expired',
                hasPermission: false 
            });
        }

        // Gerar hash do userId
        const userHash = generateHash(userId);
        
        // Verificar se o usuário tem permissões especiais
        const userPermissions = specialUsers[userHash];
        
        if (userPermissions) {
            return res.json({
                hasPermission: true,
                level: userPermissions.level,
                features: userPermissions.features,
                expires: currentTime + 600000 // Cache por 10 minutos
            });
        }

        // Usuário comum
        res.json({
            hasPermission: false,
            level: 'standard',
            features: {},
            expires: currentTime + 600000
        });

    } catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            hasPermission: false 
        });
    }
});

// Endpoint para obter configurações de combate
app.post('/combat-config', (req, res) => {
    try {
        const { userId, gameId } = req.body;
        
        if (!userId || !gameId) {
            return res.status(400).json({ error: 'Missing parameters' });
        }

        const userHash = generateHash(userId);
        const userPermissions = specialUsers[userHash];
        
        let config = {
            attackRangeMultiplier: 1.0,
            cooldownMultiplier: 0,
            hitboxMultiplier: 1.0,
            staminaCostMultiplier: 1.0,
            specialEffects: false
        };

        if (userPermissions && userPermissions.features) {
            if (userPermissions.features.enhancedCombat) {
                config.attackRangeMultiplier = 1.6;
                config.hitboxMultiplier = 1.4;
                config.specialEffects = true;
            }
            
            if (userPermissions.features.reducedCooldowns) {
                config.cooldownMultiplier = 0;
                config.staminaCostMultiplier = 0.7;
            }
        }

        res.json({
            success: true,
            config: config,
            timestamp: Date.now()
        });

    } catch (error) {
        console.error('Config error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint de health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: Date.now() });
});

// Middleware para logs (opcional)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Health check disponível em: http://localhost:${PORT}/health`);
});

module.exports = app;