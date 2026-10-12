package tearpdf.software.SPDF.model.api.misc;

import lombok.Data;
import lombok.EqualsAndHashCode;

import tearpdf.software.common.model.api.PDFFile;

@Data
@EqualsAndHashCode(callSuper = true)
public class FlattenPortfolioRequest extends PDFFile {}
