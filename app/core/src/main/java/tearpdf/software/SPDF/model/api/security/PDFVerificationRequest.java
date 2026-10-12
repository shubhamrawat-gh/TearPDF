package tearpdf.software.SPDF.model.api.security;

import lombok.Data;
import lombok.EqualsAndHashCode;

import tearpdf.software.common.model.api.PDFFile;

@Data
@EqualsAndHashCode(callSuper = true)
public class PDFVerificationRequest extends PDFFile {}
