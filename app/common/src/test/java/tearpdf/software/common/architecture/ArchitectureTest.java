package tearpdf.software.common.architecture;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import org.junit.jupiter.api.Test;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.lang.ArchRule;

/**
 * Module dependency-direction guardrails. Allowed direction: {@code saas → proprietary → common}
 * and {@code TearPDF → proprietary → common}.
 */
class ArchitectureTest {

    private static final JavaClasses commonClasses =
            new ClassFileImporter()
                    .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_JARS)
                    .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
                    .importPackages("tearpdf.software.common");

    @Test
    void commonDoesNotDependOnCore() {
        ArchRule rule =
                noClasses()
                        .that()
                        .resideInAPackage("tearpdf.software.common..")
                        .should()
                        .dependOnClassesThat()
                        .resideInAPackage("tearpdf.software.SPDF..");
        rule.check(commonClasses);
    }

    @Test
    void commonDoesNotDependOnProprietary() {
        ArchRule rule =
                noClasses()
                        .that()
                        .resideInAPackage("tearpdf.software.common..")
                        .should()
                        .dependOnClassesThat()
                        .resideInAPackage("tearpdf.software.proprietary..");
        rule.check(commonClasses);
    }

    @Test
    void commonDoesNotDependOnSaas() {
        ArchRule rule =
                noClasses()
                        .that()
                        .resideInAPackage("tearpdf.software.common..")
                        .should()
                        .dependOnClassesThat()
                        .resideInAPackage("tearpdf.software.saas..");
        rule.check(commonClasses);
    }

    @Test
    void clusterInterfacesHaveNoImplementationDependencies() {
        ArchRule rule =
                noClasses()
                        .that()
                        .resideInAPackage("tearpdf.software.common.cluster..")
                        .should()
                        .dependOnClassesThat()
                        .resideInAnyPackage(
                                "tearpdf.software.proprietary..", "tearpdf.software.saas..");
        rule.check(commonClasses);
    }
}
