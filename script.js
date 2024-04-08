// Kuuntele sivun latausta
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('wheel');
    const ctx = canvas.getContext('2d');
    const options = ['Vaihtoehto 1', 'Vaihtoehto 2', 'Vaihtoehto 3', 'Vaihtoehto 4', 'Vaihtoehto 5'];
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF8333'];
    const radius = canvas.width / 2;
    let spinAngleStart = 10;
    let startAngle = 0;
    let spinSpeed = 1; // Alustava pyörimisnopeus
    const arc = Math.PI * 2 / options.length;
    let spinningSoundPlaying = false;
    let spinningSoundInterval;

    // Äänitehosteet
    const spinSound = new Audio('spinsound.mp3');
    const resultSound = new Audio('winner.mp3');
    const spinningSound = new Audio('start.mp3');

    // Piirrä nuoli
    function drawArrow() {
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(radius - 5, 20); // Vasen sivu
        ctx.lineTo(radius + 5, 20); // Oikea sivu
        ctx.lineTo(radius, 5); // Kärki
        ctx.closePath();
        ctx.fill();
    }

    function drawWheel() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < options.length; i++) {
            const angle = startAngle + i * arc;
            ctx.fillStyle = colors[i];
            ctx.beginPath();
            ctx.arc(radius, radius, radius - 20, angle, angle + arc);
            ctx.lineTo(radius, radius);
            ctx.fill();

            ctx.save();
            ctx.fillStyle = 'black';
            ctx.translate(radius + Math.cos(angle + arc / 2) * (radius - 40), radius + Math.sin(angle + arc / 2) * (radius - 40));
            ctx.rotate(angle + arc / 2 + Math.PI / 2);
            const text = options[i];
            ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
            ctx.restore();
        }
        
        // Piirrä nuoli jokaisen päivityksen yhteydessä
        drawArrow();
    }

    function spin() {
        const minSpinTime = 3000; // Minimipyöritysaika
        const maxSpinTime = 6000; // Maksimipyöritysaika
        const initialSpinSpeed = 1; // Alustava pyörimisnopeus
        const minPlaybackRate = 0.5; // Minimitoistoaste pyöritysäänelle
        const spinSoundThreshold = 0.1; // Kulmaerotuskynnys pyörimisäänen toistamiseen
        const optionAngles = options.map((_, index) => (index + 0.5) * (360 / options.length)); // Laske kulma jokaiselle vaihtoehdolle
    
        spinAngleStart = Math.random() * 10 + 10; // Satunnaislukujen generointi pyörityskulmalle
        const spinTimeTotal = Math.random() * (maxSpinTime - minSpinTime) + minSpinTime; // Satunnaislukujen generointi pyöritysajalle
    
        function rotateWheel() {
            const spinAngle = spinAngleStart - easeOut((Date.now() - spinTimeStart), 0, spinAngleStart, spinTimeTotal);
            const adjustedSpinAngle = spinAngle * Math.PI / 180 * spinSpeed; // Säädä pyörimiskulma ottaen huomioon pyörimisnopeus
            startAngle += adjustedSpinAngle;
            drawWheel();
    
            // Laske nykyinen kulma
            const degrees = startAngle * 180 / Math.PI + 90;
    
            if ((Date.now() - spinTimeStart) < spinTimeTotal) {
                requestAnimationFrame(rotateWheel);
    
                // Toista pyöritysääntä jatkuvasti pyörittäessä
                if (!spinningSoundPlaying) {
                    setTimeout(() => {
                        spinningSound.play();
                    }, 1); // Lisää viive ennen pyöritysäänen toistamista
                    spinningSoundPlaying = true;
                }
    
                // Säädä pyöritysäänen toistotaajuutta jäljellä olevan pyörimisajan perusteella
                const remainingSpinTime = spinTimeTotal - (Date.now() - spinTimeStart);
                const playbackRate = initialSpinSpeed + (spinSpeed - initialSpinSpeed) * (remainingSpinTime / spinTimeTotal);
                spinningSound.playbackRate = Math.max(playbackRate, minPlaybackRate);
    
                // Toista pyöritysääntä lyhyesti, kun pyöränpistin ylittää vaihtoehtokulmat
                optionAngles.forEach((angle) => {
                    const angleDiff = Math.abs(degrees - angle);
                    if (angleDiff <= spinSoundThreshold * 360 && spinSound.paused) {
                        spinSound.currentTime = 0;
                        spinSound.play();
                    }
                });
            } else {
                resultSound.play(); // Toista lopputuloksen ääni
                spinningSound.pause(); // Keskeytä pyöritysääni, kun pyöriminen loppuu
                spinningSoundPlaying = false;
                clearInterval(spinningSoundInterval); // Lopeta jatkuvan pyöritysäänen toisto
    
                // Viivästä ponnahdusikkunan näyttöä lyhyen ajan
                setTimeout(function() {
                    const index = Math.floor((360 - degrees % 360) / (360 / options.length));
                    const winnerText = `Voittaja on: ${options[index]}`;
                    console.log(winnerText);
                    alert(winnerText); // Näytä voittaja ilmoituksena
                }, 600); // Säädä viiveaikaa tarpeen mukaan
            }
        }
    
        const spinTimeStart = Date.now();
        rotateWheel();
    }
    
    function easeOut(t, b, c, d) {
        const ts = (t /= d) * t;
        const tc = ts * t;
        return b + c * (tc + -3 * ts + 3 * t);
    }

    // Tapahtumakuuntelija nopeusalueen muutokselle
    document.getElementById('speedRange').addEventListener('input', function() {
        spinSpeed = parseInt(this.value);
    });
    
    document.getElementById('spin').addEventListener('click', spin);
    
    // Lisää uusi vaihtoehto
    document.getElementById('addOptionBtn').addEventListener('click', function() {
        const newOptionInput = document.getElementById('newOption');
        const newOptionValue = newOptionInput.value.trim();
        if (newOptionValue !== '') {
            options.push(newOptionValue);
            colors.push('#' + Math.floor(Math.random()*16777215).toString(16)); // Lisää satunnainen väri
            newOptionInput.value = ''; // Tyhjennä syötekenttä
            drawWheel(); // Piirrä pyörä uudelleen päivitettyjen vaihtoehtojen kanssa
        }
    });
    
    // Poista kaikki vaihtoehdot
    document.getElementById('removeAllOptionsBtn').addEventListener('click', function() {
        options.length = 0; // Tyhjennä vaihtoehtojen taulukko
        colors.length = 0; // Tyhjennä värien taulukko
        drawWheel(); // Piirrä pyörä ilman vaihtoehtoja
    });

    // Napin toiminta valikon näyttämiseen/piilottamiseen
    const menuButton = document.getElementById('menuButton');
    const menuContent = document.querySelector('.menuContent');
    menuButton.addEventListener('click', function() {
        menuContent.classList.toggle('show');
    });

    drawWheel();
});
