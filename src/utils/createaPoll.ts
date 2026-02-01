/* eslint-disable @typescript-eslint/no-explicit-any */
import { attach, Domain, Effect, Event, sample, Source, Store, TypeOfSource } from 'effector';
import { always } from 'ramda';
import { Gate } from 'effector-react';

export function createPoll<T extends Source<any>, Fn extends (data: TypeOfSource<T>) => any>({
    domain,
    fx,
    delay,
    source,
    fn,
    gate,
    launchAfterDelay,
}: PollOptions<T, Fn>): EffectorPoll {
    const start = domain.createEvent();
    const stop = domain.createEvent();
    const $isPlayed = domain.createStore(false);

    const _$delay = typeof delay === 'number' ? domain.createStore(delay) : delay;
    const _$timer = domain.createStore<number | null>(null);
    const _delayDone = domain.createEvent();
    const _launchEffect = domain.createEvent();

    const _onStartFx = domain.createEffect((timer: number | null) => {
        if (timer) {
            clearTimeout(timer);
        }
    });

    const _launchDelayFx = attach({
        effect: domain.createEffect(({ timer, delay }: { timer: number | null; delay: number }) => {
            if (timer) {
                clearTimeout(timer);
            }
            return window.setTimeout(() => {
                _delayDone();
            }, delay);
        }),
        source: _$delay,
        mapParams: (timer: number | null, delay) => ({ timer, delay }),
    });

    $isPlayed.on(start, always(true)).on(stop, always(false));

    sample({
        clock: start,
        source: _$timer,
        target: _onStartFx,
    });

    _$timer.on(start, always(null));

    sample({
        clock: _launchEffect,
        source: source ?? {},
        fn,
        target: fx,
    } as any);

    sample({
        clock: start,
        target: _launchEffect,
    });

    sample({
        clock: fx.finally,
        source: _$timer,
        filter: $isPlayed,
        target: _launchDelayFx,
    });

    sample({
        clock: _launchDelayFx.doneData,
        target: _$timer,
    });

    sample({
        clock: _delayDone,
        source: $isPlayed,
        target: _launchEffect,
    });

    if (gate) {
        if (launchAfterDelay) {
            sample({
                clock: gate.open,
                target: $isPlayed,
            });
            sample({
                clock: gate.open,
                target: _launchDelayFx,
            });
        } else {
            sample({
                clock: gate.open,
                target: start,
            });
        }

        sample({
            clock: gate.close,
            target: stop,
        });
    }

    return { start, stop, $isPlayed };
}

export type EffectorPoll = {
    start: Event<void>;
    stop: Event<void>;
    $isPlayed: Store<boolean>;
};

export type PollOptions<T extends Source<any>, Fn extends (data: TypeOfSource<T>) => any> = {
    domain: Domain;
    fx: Effect<ReturnType<Fn>, any, any>;
    delay: number | Store<number>;
    source?: T;
    fn?: Fn;
    gate?: Gate<any>;
    launchAfterDelay?: boolean;
};
