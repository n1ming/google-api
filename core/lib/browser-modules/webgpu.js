'use strict';

const WEBGPU_DEFAULTS = Object.freeze({
  enabled: true,
  preferredCanvasFormat: 'bgra8unorm',
  wgslLanguageFeatures: Object.freeze([
    'packed_4x8_integer_dot_product',
    'subgroup_uniformity',
    'subgroup_id',
    'linear_indexing',
    'readonly_and_readwrite_storage_textures',
    'unrestricted_pointer_parameters',
    'pointer_composite_access',
    'texture_and_sampler_let',
    'uniform_buffer_standard_layout'
  ]),
  adapter: Object.freeze({
    available: true,
    name: '',
    features: Object.freeze([
      'depth32float-stencil8',
      'rg11b10ufloat-renderable',
      'bgra8unorm-storage',
      'texture-formats-tier1',
      'texture-compression-bc',
      'dual-source-blending',
      'core-features-and-limits',
      'float32-filterable',
      'indirect-first-instance',
      'float32-blendable',
      'depth-clip-control',
      'texture-compression-bc-sliced-3d',
      'clip-distances',
      'shader-f16',
      'texture-formats-tier2',
      'timestamp-query',
      'primitive-index',
      'texture-component-swizzle',
      'subgroups'
    ]),
    limits: Object.freeze({
      maxTextureDimension1D: 16384,
      maxTextureDimension2D: 16384,
      maxTextureDimension3D: 2048,
      maxTextureArrayLayers: 2048,
      maxBindGroups: 4,
      maxBindGroupsPlusVertexBuffers: 24,
      maxBindingsPerBindGroup: 1000,
      maxDynamicUniformBuffersPerPipelineLayout: 10,
      maxDynamicStorageBuffersPerPipelineLayout: 8,
      maxSampledTexturesPerShaderStage: 48,
      maxSamplersPerShaderStage: 16,
      maxStorageBuffersPerShaderStage: 16,
      maxStorageTexturesPerShaderStage: 8,
      maxUniformBuffersPerShaderStage: 12,
      maxUniformBufferBindingSize: 65536,
      maxStorageBufferBindingSize: 2147483644,
      minUniformBufferOffsetAlignment: 256,
      minStorageBufferOffsetAlignment: 256,
      maxVertexBuffers: 8,
      maxBufferSize: 2147483648,
      maxVertexAttributes: 30,
      maxVertexBufferArrayStride: 2048,
      maxInterStageShaderVariables: 28,
      maxColorAttachments: 8,
      maxColorAttachmentBytesPerSample: 128,
      maxComputeWorkgroupStorageSize: 32768,
      maxComputeInvocationsPerWorkgroup: 1024,
      maxComputeWorkgroupSizeX: 1024,
      maxComputeWorkgroupSizeY: 1024,
      maxComputeWorkgroupSizeZ: 64,
      maxComputeWorkgroupsPerDimension: 65535,
      maxStorageBuffersInFragmentStage: 16,
      maxStorageTexturesInFragmentStage: 8,
      maxStorageBuffersInVertexStage: 16,
      maxStorageTexturesInVertexStage: 8
    }),
    info: Object.freeze({
      vendor: 'nvidia',
      architecture: 'blackwell',
      device: '',
      description: '',
      isFallbackAdapter: false,
      subgroupMinSize: 32,
      subgroupMaxSize: 128,
      subgroupMatrixConfigs: []
    })
  }),
  device: Object.freeze({
    features: [],
    label: '',
    lost: Object.freeze({
      reason: 'unknown',
      message: ''
    })
  })
});

const GPU_BUFFER_USAGE = Object.freeze({
  MAP_READ: 1,
  MAP_WRITE: 2,
  COPY_SRC: 4,
  COPY_DST: 8,
  INDEX: 16,
  VERTEX: 32,
  UNIFORM: 64,
  STORAGE: 128,
  INDIRECT: 256,
  QUERY_RESOLVE: 512
});

const GPU_MAP_MODE = Object.freeze({
  READ: 1,
  WRITE: 2
});

const GPU_SHADER_STAGE = Object.freeze({
  VERTEX: 1,
  FRAGMENT: 2,
  COMPUTE: 4
});

const GPU_TEXTURE_USAGE = Object.freeze({
  COPY_SRC: 1,
  COPY_DST: 2,
  TEXTURE_BINDING: 4,
  STORAGE_BINDING: 8,
  RENDER_ATTACHMENT: 16,
  TRANSIENT_ATTACHMENT: 32
});

const GPU_COLOR_WRITE = Object.freeze({
  RED: 1,
  GREEN: 2,
  BLUE: 4,
  ALPHA: 8,
  ALL: 15
});

module.exports = {
  WEBGPU_DEFAULTS,
  GPU_BUFFER_USAGE,
  GPU_MAP_MODE,
  GPU_SHADER_STAGE,
  GPU_TEXTURE_USAGE,
  GPU_COLOR_WRITE
};
