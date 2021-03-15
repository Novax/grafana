import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Select } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';

import { Field } from '../Field';
import { findOption, toOption } from '../common';
import { AzureQueryEditorFieldProps, AzureMonitorOption } from '../../types';

const ERROR_SOURCE = 'metrics-resource';
const ResourceNameField: React.FC<AzureQueryEditorFieldProps> = ({
  query,
  datasource,
  subscriptionId,
  variableOptionGroup,
  onQueryChange,
  setError,
}) => {
  const [resourceNames, setResourceNames] = useState<AzureMonitorOption[]>([]);

  useEffect(() => {
    if (!(subscriptionId && query.azureMonitor.resourceGroup && query.azureMonitor.metricDefinition)) {
      resourceNames.length > 0 && setResourceNames([]);
      return;
    }

    datasource
      .getResourceNames(subscriptionId, query.azureMonitor.resourceGroup, query.azureMonitor.metricDefinition)
      .then((results) => {
        setResourceNames(results.map(toOption));
        setError(ERROR_SOURCE, undefined);
      })
      .catch((err) => setError(ERROR_SOURCE, err));
  }, [subscriptionId, query.azureMonitor.resourceGroup, query.azureMonitor.metricDefinition]);

  const handleChange = useCallback(
    (change: SelectableValue<string>) => {
      if (!change.value) {
        return;
      }

      onQueryChange({
        ...query,
        azureMonitor: {
          ...query.azureMonitor,
          resourceName: change.value,

          metricNamespace: 'select',
          metricName: 'select',
          aggregation: '',
          timeGrain: '',
          dimensionFilters: [],
        },
      });
    },
    [query]
  );

  const options = useMemo(() => [...resourceNames, variableOptionGroup], [resourceNames, variableOptionGroup]);

  return (
    <Field label="Resource Name">
      <Select
        inputId="azure-monitor-metrics-resource-name-field"
        value={findOption(resourceNames, query.azureMonitor.resourceName)}
        onChange={handleChange}
        options={options}
        width={38}
      />
    </Field>
  );
};

export default ResourceNameField;
