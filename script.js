document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('wheel');
    const ctx = canvas.getContext('2d');
    const options = ['Vaihtoehto 1', 'Vaihtoehto 2', 'Vaihtoehto 3', 'Vaihtoehto 4', 'Vaihtoehto 5'];
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF8333'];
    const radius = canvas.width / 2;
    let spinAngleStart = 10;
    let startAngle = 0;
    let spinSpeed = 1; // Initial spin speed
    const arc = Math.PI * 2 / options.length;
    let spinningSoundPlaying = false;
    let spinningSoundInterval;

    // Sound effects
    const spinSound = new Audio('spinsound.mp3');
    const resultSound = new Audio('winner.mp3');
    const spinningSound = new Audio('start.mp3');

    // Piirrä nuoli
    function drawArrow() {
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(radius - 5, 20); // vasen sivu
        ctx.lineTo(radius + 5, 20); // oikea sivu
        ctx.lineTo(radius, 5); // kärki
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
        const minSpinTime = 3000; // Minimum spin time
        const maxSpinTime = 6000; // Maximum spin time
        const initialSpinSpeed = 1; // Initial spin speed
        const minPlaybackRate = 0.5; // Minimum playback rate for spinning sound
        const spinSoundThreshold = 0.1; // Angle threshold for playing spin sound
        const optionAngles = options.map((_, index) => (index + 0.5) * (360 / options.length)); // Calculate the angle for each option
    
        spinAngleStart = Math.random() * 10 + 10; // Randomize the spin angle
        const spinTimeTotal = Math.random() * (maxSpinTime - minSpinTime) + minSpinTime; // Randomize the spin time
    
        function rotateWheel() {
            const spinAngle = spinAngleStart - easeOut((Date.now() - spinTimeStart), 0, spinAngleStart, spinTimeTotal);
            const adjustedSpinAngle = spinAngle * Math.PI / 180 * spinSpeed; // Adjusted spin angle considering spin speed
            startAngle += adjustedSpinAngle;
            drawWheel();
    
            // Calculate the current angle
            const degrees = startAngle * 180 / Math.PI + 90;
    
            if ((Date.now() - spinTimeStart) < spinTimeTotal) {
                requestAnimationFrame(rotateWheel);
    
                // Play spinning sound continuously while spinning
                if (!spinningSoundPlaying) {
                    setTimeout(() => {
                        spinningSound.play();
                    }, 1); // Introduce a delay before playing spinning sound
                    spinningSoundPlaying = true;
                }
    
                // Adjust the playback rate of the spinning sound based on remaining spin time
                const remainingSpinTime = spinTimeTotal - (Date.now() - spinTimeStart);
                const playbackRate = initialSpinSpeed + (spinSpeed - initialSpinSpeed) * (remainingSpinTime / spinTimeTotal);
                spinningSound.playbackRate = Math.max(playbackRate, minPlaybackRate);
    
                // Play spinning sound briefly when the wheel pointer crosses option angles
                optionAngles.forEach((angle) => {
                    const angleDiff = Math.abs(degrees - angle);
                    if (angleDiff <= spinSoundThreshold * 360 && spinSound.paused) {
                        spinSound.currentTime = 0;
                        spinSound.play();
                    }
                });
            } else {
                resultSound.play(); // Play result sound
                spinningSound.pause(); // Pause spinning sound when spinning stops
                spinningSoundPlaying = false;
                clearInterval(spinningSoundInterval); // Stop continuous spinning sound
    
                // Delay showing the pop-up for a short amount of time
                setTimeout(function() {
                    const index = Math.floor((360 - degrees % 360) / (360 / options.length));
                    const winnerText = `Voittaja on: ${options[index]}`;
                    console.log(winnerText);
                    alert(winnerText); // Alert the winner
                }, 600); // Adjust the delay time as needed
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

    // Event listener for speed range change
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
            newOptionInput.value = ''; // Tyhjennä syöte kenttä
            drawWheel(); // Piirrä uudelleen pyörä päivitettyjen vaihtoehtojen kanssa
        }
    });
    
    // Poista kaikki vaihtoehdot
    document.getElementById('removeAllOptionsBtn').addEventListener('click', function() {
        options.length = 0; // Tyhjennä vaihtoehtojen taulukko
        colors.length = 0; // Tyhjennä värien taulukko
        drawWheel(); // Piirrä pyörä ilman vaihtoehtoja
    });

    drawWheel();
});
