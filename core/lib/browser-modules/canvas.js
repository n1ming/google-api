'use strict';

const CANVAS_DEFAULTS = Object.freeze({
  width: 300,
  height: 150,
  toDataURL: null,
  blob: Object.freeze({
    size: 0,
    type: 'image/png'
  }),
  fingerprint: Object.freeze({
    toDataURL: Object.freeze({
      png: null,
      jpeg: null,
      webp: null
    })
  })
});

const CANVAS_CONFIG_DEFAULTS = Object.freeze({
  toDataURL: null,
  skipRasterizationForConfiguredReadback: false,
  context: Object.freeze({
    '2d': Object.freeze({ enabled: true }),
    webgl: Object.freeze({ enabled: true }),
    webgl2: Object.freeze({ enabled: true }),
    webgpu: Object.freeze({ enabled: true }),
    bitmaprenderer: Object.freeze({ enabled: true })
  }),
  toBlob: Object.freeze({ enabled: true }),
  transferControlToOffscreen: Object.freeze({ enabled: true }),
  captureStream: Object.freeze({
    enabled: true,
    id: Object.freeze({ format: 'canvas-stream-{random}' })
  })
});

const WEBGL_DEFAULT_CONTEXT_ATTRIBUTES = Object.freeze({
  alpha: true,
  antialias: true,
  depth: true,
  desynchronized: false,
  failIfMajorPerformanceCaveat: false,
  powerPreference: 'default',
  premultipliedAlpha: true,
  preserveDrawingBuffer: false,
  stencil: false,
  xrCompatible: false
});

const WEBGL_SUPPORTED_EXTENSIONS = Object.freeze([
  'ANGLE_instanced_arrays',
  'EXT_blend_minmax',
  'EXT_clip_control',
  'EXT_color_buffer_half_float',
  'EXT_depth_clamp',
  'EXT_disjoint_timer_query',
  'EXT_float_blend',
  'EXT_frag_depth',
  'EXT_polygon_offset_clamp',
  'EXT_shader_texture_lod',
  'EXT_texture_compression_bptc',
  'EXT_texture_compression_rgtc',
  'EXT_texture_filter_anisotropic',
  'EXT_texture_mirror_clamp_to_edge',
  'EXT_sRGB',
  'KHR_parallel_shader_compile',
  'OES_element_index_uint',
  'OES_fbo_render_mipmap',
  'OES_standard_derivatives',
  'OES_texture_float',
  'OES_texture_float_linear',
  'OES_texture_half_float',
  'OES_texture_half_float_linear',
  'OES_vertex_array_object',
  'WEBGL_blend_func_extended',
  'WEBGL_color_buffer_float',
  'WEBGL_compressed_texture_s3tc',
  'WEBGL_compressed_texture_s3tc_srgb',
  'WEBGL_debug_renderer_info',
  'WEBGL_debug_shaders',
  'WEBGL_depth_texture',
  'WEBGL_draw_buffers',
  'WEBGL_lose_context',
  'WEBGL_multi_draw',
  'WEBGL_polygon_mode'
]);

const WEBGL2_SUPPORTED_EXTENSIONS = Object.freeze([
  'EXT_clip_control',
  'EXT_color_buffer_float',
  'EXT_color_buffer_half_float',
  'EXT_conservative_depth',
  'EXT_depth_clamp',
  'EXT_disjoint_timer_query_webgl2',
  'EXT_float_blend',
  'EXT_polygon_offset_clamp',
  'EXT_render_snorm',
  'EXT_texture_compression_bptc',
  'EXT_texture_compression_rgtc',
  'EXT_texture_filter_anisotropic',
  'EXT_texture_mirror_clamp_to_edge',
  'EXT_texture_norm16',
  'KHR_parallel_shader_compile',
  'NV_shader_noperspective_interpolation',
  'OES_draw_buffers_indexed',
  'OES_sample_variables',
  'OES_shader_multisample_interpolation',
  'OES_texture_float_linear',
  'OVR_multiview2',
  'WEBGL_blend_func_extended',
  'WEBGL_clip_cull_distance',
  'WEBGL_compressed_texture_s3tc',
  'WEBGL_compressed_texture_s3tc_srgb',
  'WEBGL_debug_renderer_info',
  'WEBGL_debug_shaders',
  'WEBGL_lose_context',
  'WEBGL_multi_draw',
  'WEBGL_polygon_mode',
  'WEBGL_provoking_vertex',
  'WEBGL_stencil_texturing'
]);

const WEBGL_DEFAULTS = Object.freeze({
  VENDOR: 'WebKit',
  RENDERER: 'WebKit WebGL',
  VERSION: 'WebGL 1.0 (OpenGL ES 2.0 Chromium)',
  SHADING_LANGUAGE_VERSION: 'WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)',
  UNMASKED_VENDOR_WEBGL: 'Google Inc. (NVIDIA)',
  UNMASKED_RENDERER_WEBGL: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 5060 Laptop GPU (0x00002D59) Direct3D11 vs_5_0 ps_5_0, D3D11)',
  version: Object.freeze({
    webgl1: 'WebGL 1.0 (OpenGL ES 2.0 Chromium)',
    webgl2: 'WebGL 2.0 (OpenGL ES 3.0 Chromium)'
  }),
  shadingLanguageVersion: Object.freeze({
    webgl1: 'WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)',
    webgl2: 'WebGL GLSL ES 3.00 (OpenGL ES GLSL ES 3.0 Chromium)'
  }),
  MAX_TEXTURE_SIZE: 16384,
  MAX_CUBE_MAP_TEXTURE_SIZE: 16384,
  MAX_TEXTURE_IMAGE_UNITS: 16,
  MAX_COMBINED_TEXTURE_IMAGE_UNITS: 32,
  MAX_VERTEX_TEXTURE_IMAGE_UNITS: 16,
  MAX_VERTEX_ATTRIBS: 16,
  MAX_VERTEX_UNIFORM_VECTORS: 4095,
  MAX_VARYING_VECTORS: 30,
  MAX_FRAGMENT_UNIFORM_VECTORS: 1024,
  MAX_RENDERBUFFER_SIZE: 16384,
  MAX_VIEWPORT_DIMS: Object.freeze([32767, 32767]),
  RED_BITS: 8,
  GREEN_BITS: 8,
  BLUE_BITS: 8,
  ALPHA_BITS: 8,
  DEPTH_BITS: 24,
  STENCIL_BITS: 0,
  STENCIL_VALUE_MASK: 0xffffffff,
  STENCIL_WRITEMASK: 0xffffffff,
  STENCIL_BACK_VALUE_MASK: 0xffffffff,
  STENCIL_BACK_WRITEMASK: 0xffffffff,
  SUBPIXEL_BITS: 4,
  ALIASED_LINE_WIDTH_RANGE: Object.freeze([1, 1]),
  ALIASED_POINT_SIZE_RANGE: Object.freeze([1, 1024]),
  COLOR_CLEAR_VALUE: Object.freeze([0, 0, 0, 0]),
  COLOR_WRITEMASK: Object.freeze([true, true, true, true]),
  DEPTH_RANGE: Object.freeze([0, 1]),
  COMPRESSED_TEXTURE_FORMATS: Object.freeze([]),
  MAX_TEXTURE_MAX_ANISOTROPY_EXT: 16,
  POLYGON_OFFSET_CLAMP_EXT: 0,
  supportedExtensions: WEBGL_SUPPORTED_EXTENSIONS,
  contextAttributes: WEBGL_DEFAULT_CONTEXT_ATTRIBUTES,
  SHADER_PRECISION: Object.freeze({
    VERTEX_SHADER: Object.freeze({
      LOW_FLOAT: Object.freeze({ rangeMin: 127, rangeMax: 127, precision: 23 }),
      MEDIUM_FLOAT: Object.freeze({ rangeMin: 127, rangeMax: 127, precision: 23 }),
      HIGH_FLOAT: Object.freeze({ rangeMin: 127, rangeMax: 127, precision: 23 }),
      LOW_INT: Object.freeze({ rangeMin: 31, rangeMax: 30, precision: 0 }),
      MEDIUM_INT: Object.freeze({ rangeMin: 31, rangeMax: 30, precision: 0 }),
      HIGH_INT: Object.freeze({ rangeMin: 31, rangeMax: 30, precision: 0 })
    }),
    FRAGMENT_SHADER: Object.freeze({
      LOW_FLOAT: Object.freeze({ rangeMin: 127, rangeMax: 127, precision: 23 }),
      MEDIUM_FLOAT: Object.freeze({ rangeMin: 127, rangeMax: 127, precision: 23 }),
      HIGH_FLOAT: Object.freeze({ rangeMin: 127, rangeMax: 127, precision: 23 }),
      LOW_INT: Object.freeze({ rangeMin: 31, rangeMax: 30, precision: 0 }),
      MEDIUM_INT: Object.freeze({ rangeMin: 31, rangeMax: 30, precision: 0 }),
      HIGH_INT: Object.freeze({ rangeMin: 31, rangeMax: 30, precision: 0 })
    })
  })
});

const WEBGL2_DEFAULTS = Object.freeze({
  supportedExtensions: WEBGL2_SUPPORTED_EXTENSIONS,
  MAX_COMBINED_UNIFORM_BLOCKS: 24,
  MAX_UNIFORM_BUFFER_BINDINGS: 24,
  MAX_UNIFORM_BLOCK_SIZE: 65536,
  MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS: 212988,
  MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS: 200704,
  UNIFORM_BUFFER_OFFSET_ALIGNMENT: 256,
  MAX_VERTEX_UNIFORM_COMPONENTS: 16380,
  MAX_VERTEX_UNIFORM_BLOCKS: 12,
  MAX_VERTEX_OUTPUT_COMPONENTS: 120,
  MAX_VARYING_COMPONENTS: 120,
  MAX_FRAGMENT_UNIFORM_COMPONENTS: 4096,
  MAX_FRAGMENT_UNIFORM_BLOCKS: 12,
  MAX_FRAGMENT_INPUT_COMPONENTS: 120,
  MIN_PROGRAM_TEXEL_OFFSET: -8,
  MAX_PROGRAM_TEXEL_OFFSET: 7,
  MAX_DRAW_BUFFERS: 8,
  MAX_COLOR_ATTACHMENTS: 8,
  MAX_SAMPLES: 8,
  MAX_3D_TEXTURE_SIZE: 2048,
  MAX_ARRAY_TEXTURE_LAYERS: 2048,
  MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS: 120,
  MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS: 4,
  MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS: 4,
  MAX_TEXTURE_LOD_BIAS: 2,
  MAX_ELEMENTS_VERTICES: 2147483647,
  MAX_ELEMENTS_INDICES: 2147483647,
  MAX_ELEMENT_INDEX: 4294967294
});

module.exports = {
  CANVAS_DEFAULTS,
  CANVAS_CONFIG_DEFAULTS,
  WEBGL_DEFAULT_CONTEXT_ATTRIBUTES,
  WEBGL_SUPPORTED_EXTENSIONS,
  WEBGL2_SUPPORTED_EXTENSIONS,
  WEBGL_DEFAULTS,
  WEBGL2_DEFAULTS
};
