package tearpdf.software.common.cluster.inprocess;

import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import lombok.extern.slf4j.Slf4j;

import tearpdf.software.common.cluster.ClusterBackplane;
import tearpdf.software.common.cluster.DistributedLock;
import tearpdf.software.common.cluster.InstanceRegistry;
import tearpdf.software.common.cluster.JobStore;
import tearpdf.software.common.cluster.KeyValueCache;
import tearpdf.software.common.cluster.RateLimitStore;
import tearpdf.software.common.model.ApplicationProperties;

/**
 * Default cluster backplane wiring: every interface gets an {@code InProcess*} bean. Active when
 * cluster mode is off or {@code cluster.backplane=inprocess}.
 */
@Slf4j
@Configuration
@ConditionalOnExpression(
        "!${cluster.enabled:false} ||"
                + " '${cluster.backplane:inprocess}'.equalsIgnoreCase('inprocess')")
public class InProcessClusterConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public ClusterBackplane clusterBackplane(ApplicationProperties applicationProperties) {
        log.info("Cluster backplane: in-process (single node)");
        return new InProcessClusterBackplane(applicationProperties);
    }

    @Bean
    @ConditionalOnMissingBean
    public JobStore jobStore() {
        return new InProcessJobStore();
    }

    @Bean
    @ConditionalOnMissingBean
    public RateLimitStore rateLimitStore() {
        return new InProcessRateLimitStore();
    }

    @Bean
    @ConditionalOnMissingBean
    public DistributedLock distributedLock() {
        return new InProcessDistributedLock();
    }

    @Bean
    @ConditionalOnMissingBean
    public KeyValueCache keyValueCache() {
        return new InProcessKeyValueCache();
    }

    @Bean
    @ConditionalOnMissingBean
    public InstanceRegistry instanceRegistry() {
        return new InProcessInstanceRegistry();
    }
}
