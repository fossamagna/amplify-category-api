import {
  DirectiveNode,
  ObjectTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
  FieldDefinitionNode,
  UnionTypeDefinitionNode,
  EnumTypeDefinitionNode,
  ScalarTypeDefinitionNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  EnumValueDefinitionNode,
  DirectiveDefinitionNode,
  TypeDefinitionNode,
  DocumentNode,
  ObjectTypeExtensionNode,
} from 'graphql';
// eslint-disable-next-line import/no-cycle
import {
  TransformerBeforeStepContextProvider,
  TransformerContextProvider,
  TransformerPrepareStepContextProvider,
  TransformerSchemaVisitStepContextProvider,
  TransformerValidationStepContextProvider,
  TransformerTransformSchemaStepContextProvider,
} from './transformer-context/transformer-context-provider';
import { TransformerPreProcessContextProvider } from './transformer-context';
import { TransformerLog } from './transformer-log';

export enum TransformerPluginType {
  DATA_SOURCE_PROVIDER = 'DATA_SOURCE_PROVIDER',
  DATA_SOURCE_ENHANCER = 'DATA_SOURCE_ENHANCER',
  GENERIC = 'GENERIC',
  AUTH = 'AUTH',
}

export interface TransformerPluginProvider {
  pluginType: TransformerPluginType;

  name: string;

  readonly directive: DirectiveDefinitionNode;

  typeDefinitions: TypeDefinitionNode[];

  /**
   * The first method call in the pre-processing lifecycle giving opportunity
   * to build metadata prior to the mutation step which returns a mutated
   * schema
   * @param context
   */
  preMutateSchema?: (context: TransformerPreProcessContextProvider) => void;

  /**
   * A pre-processing step executed prior to and separate from transformation.
   * This method is used by plugins to make any necessary schema modifications
   * before processing is done. This allows external sources to make necessary
   * schema modifications without adding all the other transformation logic
   * @param context Pre processing context provider
   * @returns DocumentNode returns a modified GraphQL DocumentNode
   */
  mutateSchema?: (context: TransformerPreProcessContextProvider) => DocumentNode;

  /**
   * An initializer that is called once at the beginning of a transformation.
   * Initializers are called in the order they are declared.
   */
  before?: (context: TransformerBeforeStepContextProvider) => void;

  /**
   * A transformer implements a single function per location that its directive can be applied.
   * This method handles transforming directives on object type definitions.
   */
  object?: (definition: ObjectTypeDefinitionNode, directive: DirectiveNode, acc: TransformerSchemaVisitStepContextProvider) => void;

  /**
   * A transformer implements a single function per location that its directive can be applied.
   * This method handles transforming directives on interface type definitions.
   */
  interface?: (definition: InterfaceTypeDefinitionNode, directive: DirectiveNode, acc: TransformerSchemaVisitStepContextProvider) => void;

  /**
   * A transformer implements a single function per location that its directive can be applied.
   * This method handles transforming directives on object for field definitions.
   */
  field?: (
    parent: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode,
    definition: FieldDefinitionNode,
    directive: DirectiveNode,
    acc: TransformerSchemaVisitStepContextProvider,
  ) => void;

  /**
   * A transformer implements a single function per location that its directive can be applied. This method handles transforming directives
   * on fields of extended types.
   */
  fieldOfExtendedType?: (
    parent: ObjectTypeExtensionNode,
    definition: FieldDefinitionNode,
    directive: DirectiveNode,
    acc: TransformerSchemaVisitStepContextProvider,
  ) => void;

  /**
   * A transformer implements a single function per location that its directive can be applied.
   * This method handles transforming directives on object or input argument definitions.
   */
  argument?: (definition: InputValueDefinitionNode, directive: DirectiveNode, context: TransformerSchemaVisitStepContextProvider) => void;

  /**
   * A transformer implements a single function per location that its directive can be applied.
   * This method handles transforming directives on union definitions.
   */
  union?: (definition: UnionTypeDefinitionNode, directive: DirectiveNode, context: TransformerSchemaVisitStepContextProvider) => void;

  /**
   * A transformer implements a single function per location that its directive can be applied.
   * This method handles transforming directives on enum definitions.
   */
  enum?: (definition: EnumTypeDefinitionNode, directive: DirectiveNode, context: TransformerSchemaVisitStepContextProvider) => void;

  /**
   * A transformer implements a single function per location that its directive can be applied.
   * This method handles transforming directives on enum value definitions.
   */
  enumValue?: (definition: EnumValueDefinitionNode, directive: DirectiveNode, context: TransformerSchemaVisitStepContextProvider) => void;

  /**
   * A transformer implements a single function per location that its directive can be applied.
   * This method handles transforming directives on scalar definitions.
   */
  scalar?: (definition: ScalarTypeDefinitionNode, directive: DirectiveNode, context: TransformerSchemaVisitStepContextProvider) => void;

  /**
   * A transformer implements a single function per location that its directive can be applied.
   * This method handles transforming directives on input definitions.
   */
  input?: (definition: InputObjectTypeDefinitionNode, directive: DirectiveNode, context: TransformerSchemaVisitStepContextProvider) => void;

  /**
   * A transformer implements a single function per location that its directive can be applied.
   * This method handles transforming directives on input value definitions.
   */
  inputValue?: (definition: InputValueDefinitionNode, directive: DirectiveNode, context: TransformerSchemaVisitStepContextProvider) => void;

  /**
   *  Validate the schema after individual transformers finishes parsing the AST
   */
  validate?: (context: TransformerValidationStepContextProvider) => void;

  /**
   * Create additional  resources after validation before updating schema or generating resolvers
   */
  prepare?: (context: TransformerPrepareStepContextProvider) => void;

  /**
   * Update the schema with additional queries and input types
   */
  transformSchema?: (context: TransformerTransformSchemaStepContextProvider) => void;

  /**
   * generate resolvers
   */
  generateResolvers?: (context: TransformerContextProvider) => void;

  /**
   * A finalizer that is called once after a transformation.
   * Finalizers are called in reverse order as they are declared.
   */
  after?: (context: TransformerContextProvider) => void;

  /**
   * Get the current buffer of logs from the transformer
   */
  getLogs?: () => TransformerLog[];
}
