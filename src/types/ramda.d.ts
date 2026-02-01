// Расширение модуля ramda с переопределением типов для nthArg
// Используем правильный синтаксис расширения модуля TypeScript

// Сначала импортируем все типы из оригинального модуля
import 'ramda';

// Затем расширяем модуль, переопределяя только nthArg
declare module 'ramda' {
    // Переопределенные функции с улучшенными типами
    export function nthArg<T>(n: 0): (a: T) => T;
    export function nthArg<T>(n: 1): (_, a: T) => T;
    export function nthArg<T>(n: 2): (_, _, a: T) => T;
    export function nthArg<T>(n: 3): (_, _, _, a: T) => T;
}
