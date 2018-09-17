/* eslint-env browser */
/* eslint-disable no-magic-numbers, no-mixed-operators */

((root) => {
    let fps = 60;
    let frameDelta = 0;
    let framesSinceLastFpsUpdate = 0;
    let lastFpsUpdate = 0;
    let lastFrameTimeMs = 0;
    let minFrameDelay = 0;
    let numUpdateSteps = 0;
    let panic = false;
    let running = false;
    let simulationTimestep = 1000 / 60;
    let started = false;

    const fpsAlpha = 0.9;
    const fpsUpdateInterval = 1000;
    const NOOP = () => {};

    let begin = NOOP;
    let draw = NOOP;
    let end = NOOP;
    let update = NOOP;

    let rafHandle; // for GC

    function animate(timestamp) {
        rafHandle = requestAnimationFrame(animate);

        if (timestamp < lastFrameTimeMs + minFrameDelay) {
            return;
        }

        frameDelta += timestamp - lastFrameTimeMs;
        lastFrameTimeMs = timestamp;

        begin(timestamp, frameDelta);

        if (timestamp > lastFpsUpdate + fpsUpdateInterval) {
            fps = fpsAlpha * framesSinceLastFpsUpdate * 1000 /
                (timestamp - lastFpsUpdate) + (1 - fpsAlpha) * fps;
            lastFpsUpdate = timestamp;
            framesSinceLastFpsUpdate = 0;
        }

        framesSinceLastFpsUpdate++;

        numUpdateSteps = 0;
        while (frameDelta >= simulationTimestep) {
            update(simulationTimestep);
            frameDelta -= simulationTimestep;
            if (++numUpdateSteps >= 240) {
                panic = true;
                break;
            }
        }

        draw(frameDelta / simulationTimestep);
        end(fps, panic);
        panic = false;
    }

    root.MainLoop = {
        getSimulationTimestep() {
            return simulationTimestep;
        },
        setSimulationTimestep(timestep) {
            simulationTimestep = timestep;
            return this;
        },
        getFPS() {
            return fps;
        },
        getMaxAllowedFPS() {
            return 1000 / minFrameDelay;
        },
        setMaxAllowedFPS(allowedFps) {
            if (typeof allowedFps === 'undefined') {
                allowedFps = Infinity;
            }
            if (allowedFps === 0) {
                this.stop();
            }
            else {
                // Dividing by Infinity returns zero.
                minFrameDelay = 1000 / allowedFps;
            }
            return this;
        },
        resetFrameDelta() {
            const oldFrameDelta = frameDelta;
            frameDelta = 0;
            return oldFrameDelta;
        },
        setBegin(fun) {
            begin = fun || begin;
            return this;
        },
        setUpdate(fun) {
            update = fun || update;
            return this;
        },
        setDraw(fun) {
            draw = fun || draw;
            return this;
        },
        setEnd(fun) {
            end = fun || end;
            return this;
        },
        start() {
            if (!started) {
                started = true;
                rafHandle = requestAnimationFrame((timestamp) => {
                    draw(1);
                    running = true;
                    lastFrameTimeMs = timestamp;
                    lastFpsUpdate = timestamp;
                    framesSinceLastFpsUpdate = 0;

                    rafHandle = requestAnimationFrame(animate);
                });
            }
            return this;
        },
        stop() {
            running = false;
            started = false;
            cancelAnimationFrame(rafHandle);
            return this;
        },
        isRunning() {
            return running;
        },
    };
})(this);
