import React, { useState, useMemo } from 'react'
import { BlockContext } from 'core/blocks/types'
// @ts-ignore
import Block from 'core/blocks/block/BlockVariant'
// @ts-ignore
import ChartContainer from 'core/charts/ChartContainer'
import { RankingChart, RankingChartSerie } from 'core/charts/generic/RankingChart'
// @ts-ignore
import ButtonGroup from 'core/components/ButtonGroup'
// @ts-ignore
import Button from 'core/components/Button'
import { Entity } from 'core/types'
// @ts-ignore
import T from 'core/i18n/T'
// @ts-ignore
import { useI18n } from 'core/i18n/i18nContext'
import { getTableData } from 'core/helpers/datatables'

import { MetricId, ALL_METRICS } from 'core/helpers/units'

export interface MetricBucket {
    year: number
    rank: number
    percentage_question: number
}

export interface ToolData extends Record<MetricId, MetricBucket[]> {
    id: string
    entity: Entity
    usage: MetricBucket[]
    awareness: MetricBucket[]
    interest: MetricBucket[]
    satisfaction: MetricBucket[]
}

export interface ToolsExperienceRankingBlockData {
    years: number[]
    experience: ToolData[]
}

export interface ToolsExperienceRankingBlockProps {
    block: BlockContext<
        'toolsExperienceRankingTemplate',
        'ToolsExperienceRankingBlock',
        { toolIds: string },
        any
    >
    triggerId: MetricId
    data: ToolsExperienceRankingBlockData
    titleProps: any
}

const getChartData = ({ data, controlledMetric }: { data: ToolData[]; controlledMetric: any }) => {
    return useMemo(
        () =>
            data.map(tool => {
                return {
                    id: tool.id,
                    name: tool?.entity?.name,
                    data: tool[controlledMetric]?.map(bucket => {
                        return {
                            x: bucket.year,
                            y: bucket.rank,
                            percentage_question: bucket.percentage_question
                        }
                    })
                }
            }),
        [data, controlledMetric]
    )
}

export const ToolsExperienceRankingBlock = ({
    block,
    data,
    triggerId
}: ToolsExperienceRankingBlockProps) => {
    const [metric, setMetric] = useState<MetricId>('satisfaction')
    const { getString } = useI18n()

    const controlledMetric = triggerId || metric

    const { years, experience } = data
    const chartData: RankingChartSerie[] = getChartData({ data: experience, controlledMetric })

    const tableData = experience.map(tool => {
        const cellData = { label: tool?.entity?.name }
        ALL_METRICS.forEach(metric => {
            cellData[`${metric}_percentage`] = tool[metric]?.map(y => ({
                year: y.year,
                value: y.percentage_question
            }))
            cellData[`${metric}_rank`] = tool[metric]?.map(y => ({
                year: y.year,
                value: y.rank
            }))
        })
        return cellData
    })

    return (
        <Block
            block={block}
            // titleProps={{ switcher: <Switcher setMetric={setMetric} metric={controlledMetric} /> }}
            data={data}
            modeProps={{
                units: controlledMetric,
                options: ALL_METRICS,
                onChange: setMetric,
                i18nNamespace: 'options.experience_ranking'
            }}
            tables={[
                getTableData({
                    data: tableData,
                    valueKeys: ALL_METRICS.map(m => `${m}_rank`),
                    years
                })
            ]}
        >
            <ChartContainer height={experience.length * 50 + 80} minWidth={800}>
                <RankingChart data={chartData} />
            </ChartContainer>
        </Block>
    )
}
