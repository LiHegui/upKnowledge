// 精灵图
import * as THREE from 'three'
export default function setSprite(target) {
    const texture = new THREE.TextureLoader().load('/img/rain.png')
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
    });
    // 创建Group,生成16000个精灵模型，模拟下雨效果，随机位置
    const group = new THREE.Group();
    for (let i = 0; i < 16000; i++) {
        const sprite = new THREE.Sprite(spriteMaterial);
        group.add(sprite);
        sprite.scale.set(1, 1, 1);
        const x = 1000 * (Math.random() - 0.5);
        const y = 600 * Math.random();
        const z = 1000 * (Math.random() - 0.5);
        sprite.position.set(x, y, z)
    }
    target.add(group);
    function loop() {
        group.children.forEach(sprite => {
            sprite.position.y -= 1;
            if (sprite.position.y < 0) {
                // 如果雨滴落到地面，重置y，从新下落
                sprite.position.y = 600;
            }
        });
        requestAnimationFrame(loop);
    }
    loop();
}