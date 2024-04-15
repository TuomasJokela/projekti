document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('wheel');
    const ctx = canvas.getContext('2d');
    let options = ['Vaihtoehto 1', 'Vaihtoehto 2', 'Vaihtoehto 3', 'Vaihtoehto 4', 'Vaihtoehto 5'];
    let colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF8333'];
    const radius = canvas.width / 2;
    let spinAngleStart = 10;
    let startAngle = 0;
    let spinSpeed = 1;
    const arc = Math.PI * 2 / options.length;
    let spinningSoundPlaying = false;
    let spinningSoundInterval;

    // Äänitehosteet
    const spinSound = new Audio('spinsound.mp3');
    const resultSound = new Audio('winner.mp3');
    const spinningSound = new Audio('start.mp3');
    const backgroundMusic = new Audio('music.mp3');

    // Musiikki oletuksena pois päältä
    backgroundMusic.pause();

    // Piirrä nuoli
    function drawArrow() {
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(radius - 5, 20);
        ctx.lineTo(radius + 5, 20);
        ctx.lineTo(radius, 5);
        ctx.closePath();
        ctx.fill();
    }

    function drawWheel() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < options.length; i++) {
            if (!document.getElementById(`option_${i}`).checked) continue; // Skip drawing if option is unchecked
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
        const minSpinTime = 3000;
        const maxSpinTime = 6000;
        const initialSpinSpeed = 1;
        const minPlaybackRate = 0.5;
        const spinSoundThreshold = 0.1;
        const optionAngles = options.map((_, index) => (index + 0.5) * (360 / options.length));

        spinAngleStart = Math.random() * 10 + 10;
        const spinTimeTotal = Math.random() * (maxSpinTime - minSpinTime) + minSpinTime;

        function rotateWheel() {
            const spinAngle = spinAngleStart - easeOut((Date.now() - spinTimeStart), 0, spinAngleStart, spinTimeTotal);
            const adjustedSpinAngle = spinAngle * Math.PI / 180 * spinSpeed;
            startAngle += adjustedSpinAngle;
            drawWheel();

            const degrees = startAngle * 180 / Math.PI + 90;

            if ((Date.now() - spinTimeStart) < spinTimeTotal) {
                requestAnimationFrame(rotateWheel);

                if (!spinningSoundPlaying) {
                    setTimeout(() => {
                        spinningSound.play();
                    }, 1);
                    spinningSoundPlaying = true;
                }

                const remainingSpinTime = spinTimeTotal - (Date.now() - spinTimeStart);
                const playbackRate = initialSpinSpeed + (spinSpeed - initialSpinSpeed) * (remainingSpinTime / spinTimeTotal);
                spinningSound.playbackRate = Math.max(playbackRate, minPlaybackRate);

                optionAngles.forEach((angle, index) => {
                    const angleDiff = Math.abs(degrees - angle);
                    if (angleDiff <= spinSoundThreshold * 360 && spinSound.paused) {
                        spinSound.currentTime = 0;
                        spinSound.play();
                    }
                });
            } else {
                resultSound.play();
                spinningSound.pause();
                spinningSoundPlaying = false;
                clearInterval(spinningSoundInterval);

                setTimeout(function() {
                    const index = Math.floor((360 - degrees % 360) / (360 / options.length));
                    const winnerText = `Voittaja on: ${options[index]}`;
                    console.log(winnerText);
                    alert(winnerText);
                }, 600);
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

    // Napin toiminta äänien käynnistämiseen/pysäyttämiseen
    const toggleSoundButton = document.getElementById('toggleSoundButton');
    let isSoundOn = false; // Äänet oletuksena pois päältä
    toggleSoundButton.addEventListener('click', function() {
        if (isSoundOn) {
            backgroundMusic.pause();
            spinningSound.pause();
            spinSound.pause();
            isSoundOn = false;
            toggleSoundButton.textContent = 'Musiikki Päälle';
        } else {
            backgroundMusic.play();
            isSoundOn = true;
            toggleSoundButton.textContent = 'Musiikki Pois';
        }
    });

    document.getElementById('spin').addEventListener('click', spin);

    // Päivitä vaihtoehtojen listaus sivupaneelissa
    function updateOptionsList() {
        const optionsList = document.getElementById('optionsList');
        optionsList.innerHTML = '';
        options.forEach((option, index) => {
            const listItem = document.createElement('div');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `option_${index}`;
            checkbox.checked = true;
            checkbox.addEventListener('change', function() {
                if (!this.checked) {
                    options.splice(index, 1);
                    colors.splice(index, 1);
                    updateOptionsList();
                    drawWheel();
                }
            });
            listItem.appendChild(checkbox);
            const label = document.createElement('label');
            label.setAttribute('for', `option_${index}`);
            label.textContent = option;
            listItem.appendChild(label);
            optionsList.appendChild(listItem);
        });
    }

    // Lisää uusi vaihtoehto
    document.getElementById('addOptionBtn').addEventListener('click', function() {
        const newOptionInput = document.getElementById('newOption');
        const newOptionValue = newOptionInput.value.trim();
        if (newOptionValue !== '') {
            options.push(newOptionValue);
            colors.push('#' + Math.floor(Math.random()*16777215).toString(16));
            newOptionInput.value = '';
            updateOptionsList();
            drawWheel();
        }
    });

    // Poista kaikki vaihtoehdot
    document.getElementById('removeAllOptionsBtn').addEventListener('click', function() {
        options = [];
        colors = [];
        updateOptionsList();
        drawWheel();
    });

    // Napin toiminta valikon näyttämiseen/piilottamiseen
    const menuButton = document.getElementById('menuButton');
    const menuContent = document.querySelector('.menuContent');
    menuButton.addEventListener('click', function() {
        menuContent.classList.toggle('show');
    });

    // Valmiiden arpapohjien napit
    const premadeTemplates = document.querySelectorAll('.premade-template');
    premadeTemplates.forEach(button => {
        button.addEventListener('click', function() {
            const optionsString = this.getAttribute('data-options');
            options = optionsString.split(',').map(option => option.trim());
            colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF8333'].slice(0, options.length);
            updateOptionsList();
            drawWheel();
        });
    });

    updateOptionsList();
    drawWheel();
});
