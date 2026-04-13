import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';

function normalizeImageSrc(src) {
    const value = String(src || '').trim();

    if (!value) {
        return '';
    }

    if (/^(data:|blob:|https?:\/\/)/i.test(value)) {
        return value;
    }

    if (value.startsWith('../')) {
        return `/${value.replace(/^(\.\.\/)+/, '')}`;
    }

    if (value.startsWith('./')) {
        return `/${value.replace(/^(\.\/)+/, '')}`;
    }

    if (value.startsWith('/')) {
        return value;
    }

    return `/${value.replace(/^\/+/, '')}`;
}

export default function AppImage({
    src,
    fallbackSrc,
    alt = '',
    width = 100,
    height = 100,
    sizes,
    style,
    unoptimized,
    onError,
    ...rest
}) {
    const normalizedSrc = useMemo(() => normalizeImageSrc(src), [src]),
        normalizedFallbackSrc = useMemo(() => normalizeImageSrc(fallbackSrc), [fallbackSrc]),
        [currentSrc, setCurrentSrc] = useState(normalizedSrc || normalizedFallbackSrc);

    useEffect(() => {
        setCurrentSrc(normalizedSrc || normalizedFallbackSrc);
    }, [normalizedFallbackSrc, normalizedSrc]);

    if (!currentSrc) {
        return null;
    }

    const remote = /^https?:\/\//i.test(currentSrc),
        shouldSkipOptimization = unoptimized ?? (remote || currentSrc.endsWith('.svg'));

    return (
        <Image
            alt={alt}
            height={height}
            onError={(event) => {
                if (normalizedFallbackSrc && currentSrc !== normalizedFallbackSrc) {
                    setCurrentSrc(normalizedFallbackSrc);
                }

                onError?.(event);
            }}
            sizes={sizes}
            src={currentSrc}
            style={style}
            unoptimized={shouldSkipOptimization}
            width={width}
            {...rest}
        />
    );
}
