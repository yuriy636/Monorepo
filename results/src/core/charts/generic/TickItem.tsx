import React, { memo, useMemo } from 'react'
import { ChartComponentProps, BlockUnits, BucketItem, BlockLegend, TickItemProps } from 'core/types'
import { useTheme } from 'styled-components'
import { useI18n } from 'core/i18n/i18nContext'
import TooltipComponent from 'core/components/Tooltip'

const labelMaxLength = 20

const shorten = (label: string) => {
    if (label?.length > labelMaxLength + 1) {
        return label?.substring(0, labelMaxLength) + '…'
    } else {
        return label
    }
}

export const Text = ({
    hasLink = false,
    label,
    description,
    tickRotation,
    i18nNamespace
}: {
    hasLink: boolean
    label: string
    description: string
    tickRotation?: number
    i18nNamespace?: string
}) => {
    if (!label) {
        return null
    }
    const theme = useTheme()
    const shortenLabel = label.length > labelMaxLength
    const shortLabel = shortenLabel ? shorten(label) : label

    const textProps = {
        transform: 'translate(-10,0) rotate(0)',
        dominantBaseline: 'central',
        textAnchor: 'end',
        style: {
            fill: hasLink ? theme.colors.link : theme.colors.text,
            fontSize: 14,
            fontFamily: theme.typography.fontFamily
        }
    }

    if (tickRotation) {
        textProps.transform = `translate(0,-10) rotate(${tickRotation} 0 0)`
        textProps.textAnchor = 'start'
    }

    const component = <text {...textProps}>{shortLabel ?? label}</text>

    return (
        <TooltipComponent
            trigger={component}
            contents={description ?? label}
            asChild={true}
            clickable={hasLink}
        />
    )
}

export const getBucketLabel = args => {
    const { getString } = useI18n()
    const { shouldTranslate, i18nNamespace, id, entity, shortenLabel = false, label: providedLabel } = args
    let label
    const s = getString(`options.${i18nNamespace}.${id}`)

    if (providedLabel) {
        label = providedLabel
    } else if (entity?.name) {
        label = entity.nameClean || entity.name
    } else if (shouldTranslate && !s.missing) {
        label = s.tClean || s.t
    } else {
        label = id
    }

    const shortenedLabel = shortenLabel ? shorten(label) + '…' : label

    return shortenedLabel
}

export const TickItem = (tick: TickItemProps) => {
    const { getString } = useI18n()

    const { x, y, value, shouldTranslate, i18nNamespace, entity, tickRotation, label } = tick

    let link,
        description = tick.description

    const tickLabel = getBucketLabel({ shouldTranslate, i18nNamespace, entity, id: tick.value, label })

    if (entity) {
        const { homepage, github } = entity
        link = homepage?.url || github?.url
    }
    if (shouldTranslate) {
        const descriptionString = getString(`options.${i18nNamespace}.${value}.description`)
        if (!descriptionString.missing) {
            description = descriptionString.t
        }
    }

    const textProps = {
        label: tickLabel,
        description,
        tickRotation
    }

    return (
        <g transform={`translate(${x},${y})`}>
            {link ? (
                <a href={link}>
                    <Text hasLink={true} {...textProps} />
                </a>
            ) : (
                <Text hasLink={false} {...textProps} />
            )}
        </g>
    )
}

export default TickItem
