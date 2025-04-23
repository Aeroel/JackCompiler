export { Tokens_To_VM_Code_Converter };
import fs from 'node:fs';
import { Convenient_Way_To_Advance_Through_Tokens } from './Convenient_Way_To_Advance_Through_Tokens.js';
import { Helper_Functions } from './Helper_Functions.js';
import { Tokens_Saver } from './Tokens_Saver.js';
import type { Jack_Symbol, Token } from '#root/Type_Definitions.js';
import { Symbol_Table } from './Symbol_Table.js';
import { VM_Commands_Writer } from './VM_Commands_Writer.js';

class Tokens_To_VM_Code_Converter {
    static tokens: Token[] = [];
    static className: string = '';
    static symbol_table: Symbol_Table;
    static vm_writer: VM_Commands_Writer;
    static tokenizer: Convenient_Way_To_Advance_Through_Tokens;
    static Save_VM_Code_In_Same_Dir_As_Path(filePath: string) {
        const vmFilePath = filePath + ".vm";
        console.log(`[Tokens To VM Code] Saving VM code into new file at ${vmFilePath}`);
        const vmCode = this.vm_writer.getCode();
        fs.writeFileSync(vmFilePath, vmCode);
    }
    static appendToXML(str: string) {
        // does nothing, was used in JackAnalyzer, to be removed later
    }
    static Convert_Tokens_Into_VM_Code(tokens: Token[]) {
        console.log(`[Tokens To VM Code ] Converting tokens array of length ${tokens.length} into VM Code `);

        this.tokens = tokens;
        this.tokenizer = new Convenient_Way_To_Advance_Through_Tokens(tokens);
        this.symbol_table = new Symbol_Table();
        this.vm_writer = new VM_Commands_Writer();

        this.compile_class();

        const vm_code = this.vm_writer.getCode();
    }
    static compile_class_name() {
        const className = this.compile_identifier();
        Tokens_To_VM_Code_Converter.className = className;
    }
    static compile_class() {


        Tokens_To_VM_Code_Converter.consume("class");
        Tokens_To_VM_Code_Converter.compile_class_name(); // class name
        Tokens_To_VM_Code_Converter.consume("{");
        Tokens_To_VM_Code_Converter.compile_zero_or_more_class_var_decs();
        Tokens_To_VM_Code_Converter.compile_zero_or_more_class_subroutine_decs();
        Tokens_To_VM_Code_Converter.consume("}");



    }
    static compile_zero_or_more_class_var_decs() {
        let decsLeftToProcess;

        prepare_for_next_iteration();

        while (decsLeftToProcess) {
            Tokens_To_VM_Code_Converter.compile_class_var_dec();
            prepare_for_next_iteration();

        }

        function prepare_for_next_iteration() {
            decsLeftToProcess = Boolean(Tokens_To_VM_Code_Converter.tokenizer.tokenValue() === 'field' || Tokens_To_VM_Code_Converter.tokenizer.tokenValue() === 'static');
        }

    }
    static compile_zero_or_more_class_subroutine_decs() {
        let token_is_constructor_or_function_or_method;

        let subroutine_decs_left_to_process;

        prepare_for_an_iteration();

        while (subroutine_decs_left_to_process) {
            Tokens_To_VM_Code_Converter.compile_class_subroutine_dec();

            prepare_for_an_iteration();
        }

        function prepare_for_an_iteration() {

            token_is_constructor_or_function_or_method = Boolean(["constructor", "method", "function"].includes(Tokens_To_VM_Code_Converter.tokenizer.tokenValue()));

            subroutine_decs_left_to_process = Boolean(token_is_constructor_or_function_or_method);
        }

    }
    static compile_class_subroutine_dec() {

        this.symbol_table.newSubroutine();

        const subroutineKind = Tokens_To_VM_Code_Converter.consume_constructor_or_function_or_method();
        Tokens_To_VM_Code_Converter.compile_subroutine_return_type();
        const subroutineName = Tokens_To_VM_Code_Converter.compile_subroutine_name();
        Tokens_To_VM_Code_Converter.consume('(');
        let paramsCount = Tokens_To_VM_Code_Converter.compile_parameter_list();
        Tokens_To_VM_Code_Converter.consume(')');


        const needsThis = !(subroutineKind === 'function');
        if (needsThis) {
            paramsCount++; // to account for "this" (0th available param) in methods and constructors. functions are like static functions in JS, so they don't need the extra param as they have no "this".
        }


        this.vm_writer.writeFunction(subroutineName, paramsCount);


        Tokens_To_VM_Code_Converter.compile_subroutine_body();
    }
    static compile_subroutine_name() {
        return this.compile_identifier();
    }
    static compile_parameter_list() {
        const paramsCount = this.parameters_are_optional();
        return paramsCount;
    }
    static parameters_are_optional() {
        let paramsCount = 0;
        let paramIsEmpty = Boolean(this.tokenizer.tokenValue() === ')');
        if (paramIsEmpty) {
            return paramsCount;
        }
        paramsCount++;
        this.compile_param();
        const additionalParamsCount = this.then_zero_or_more_comma_separated_params();
        paramsCount = paramsCount + additionalParamsCount;
        return paramsCount;

    }
    static compile_param() {
        // param type
        this.compile_param_type();
        // param name
        this.compile_param_name();
    }
    static compile_param_type() {
        this.consume(this.tokenizer.tokenValue());
    }
    static compile_param_name() {
        this.compile_identifier();
    }
    static then_zero_or_more_comma_separated_params() {
        let params_count = 0;

        let more_params = Boolean(this.tokenizer.tokenValue() === ',');
        while (more_params) {

            this.consume(',');
            this.compile_param_type();
            this.compile_param_name();

            more_params = Boolean(this.tokenizer.tokenValue() === ',');

            params_count++;
        }
        return params_count;
    }
    static compile_subroutine_body() {
        this.appendToXML(`<subroutineBody>`);
        this.consume('{');
        this.compile_zero_or_more_var_decs();
        this.compile_statements();
        this.consume('}');
        this.appendToXML(`</subroutineBody>`);
    }
    static compile_statements() {
        Tokens_To_VM_Code_Converter.appendToXML(`<statements>`);
        const possibleStatements = ["let", "if", "while", "do", "return"];
        let isAStatement;
        let statements_left_to_process;
        function prepare_for_next_iteration() {
            const statement_type = Tokens_To_VM_Code_Converter.tokenizer.tokenValue();
            isAStatement = Boolean(possibleStatements.includes(statement_type));
            statements_left_to_process = Boolean(isAStatement);
        }
        prepare_for_next_iteration();
        while (statements_left_to_process) {
            Tokens_To_VM_Code_Converter.compile_statement();
            prepare_for_next_iteration();
        }
        this.appendToXML(`</statements>`);

    }
    static compile_statement() {
        const statement_type = Tokens_To_VM_Code_Converter.tokenizer.tokenValue();
        switch (statement_type) {
            case "let":
                this.compile_let_statement();
                break;
            case "if":
                this.compile_if_statement();
                break;
            case "while":
                this.compile_while_statement();
                break;
            case "do":
                this.compile_do_statement();
                break;
            case "return":
                this.compile_return_statement();
                break;
        }

    }
    static compile_let_statement() {

        this.consume('let');
        this.compile_var_name();
        this.compile_optional_array_access_notation();

        this.consume('=');
        this.compile_expression();
        this.consume(';');

    }
    static compile_optional_array_access_notation() {
        const squareBracketsNotationPresent = Boolean(Tokens_To_VM_Code_Converter.tokenizer.tokenValue() === '[');

        if (squareBracketsNotationPresent) {
            Tokens_To_VM_Code_Converter.consume('[');
            Tokens_To_VM_Code_Converter.compile_expression();
            Tokens_To_VM_Code_Converter.consume(']');
        }
    }
    static compile_if_statement() {
        this.consume('if');
        this.consume('(');
        this.compile_expression();
        this.consume(')');
        this.consume('{');
        this.compile_statements();
        this.consume('}');
        this.compile_optional_else_clause();

    }
    static compile_optional_else_clause() {
        const elseClausePresent = Boolean(this.tokenizer.tokenValue() === 'else');
        if (!elseClausePresent) {
            return;
        }
        this.consume('else');
        this.consume('{');
        this.compile_statements();
        this.consume('}');
    }
    static compile_while_statement() {
        this.consume('while');
        this.consume('(');
        this.compile_expression();
        this.consume(')');
        this.consume('{');
        this.compile_statements();
        this.consume('}');
    }
    static compile_do_statement() {
        this.consume('do');
        this.compile_subroutine_call();
        this.consume(';');
    }
    static compile_return_statement() {
        this.consume('return');
        this.compile_optional_return_value();
        this.consume(';');
    }
    static compile_optional_return_value() {
        const returnStatementEndsNow = Boolean(this.tokenizer.tokenValue() === ';');
        const theOptionalReturnValueIsPresent = !returnStatementEndsNow;
        if (returnStatementEndsNow) {
            return;
        }
        this.compile_expression();
    }

    static compile_expression() {
        this.appendToXML(`<expression>`);
        this.compile_term();
        this.compile_additional_zero_or_more_occurrences_of_op_term();
        this.appendToXML(`</expression>`);
    }
    static compile_additional_zero_or_more_occurrences_of_op_term() {
        let operators = [
            "+", "-", "*", "/", "&", "|", "<", ">", "="
        ];
        operators = operators.map((op) => {
            return Tokens_Saver.escape_special_xml_characters(op);
        })
        console.log(operators);


        let anyMoreLeft = Boolean(operators.includes(Tokens_To_VM_Code_Converter.tokenizer.tokenValue()));
        while (anyMoreLeft) {
            Tokens_To_VM_Code_Converter.consume_operator();
            Tokens_To_VM_Code_Converter.compile_term();

            anyMoreLeft = Boolean(operators.includes(Tokens_To_VM_Code_Converter.tokenizer.tokenValue()));
        }
    }
    static consume_operator() {
        this.consume(this.tokenizer.tokenValue());
    }

    static compile_term() {
        this.appendToXML(`<term>`);

        const term_type = this.determine_term_type();

        this.call_term_type_handler(term_type);

        this.appendToXML(`</term>`);


    }
    static call_term_type_handler(term_type: string) {
        console.log(term_type);

        switch (term_type) {
            case "int_const":
                this.term_int_const();
                break;
            case "str_const":
                this.term_str_const();
                break;
            case "keyword_const":
                this.term_keyword_const();
                break;
            case "var_name":
                this.term_var_name();
                break;
            case "var_name_array_access":
                this.term_var_name_array_access();
                break;
            case "subroutine_call":
                this.term_subroutine_call();
                break;

            case "expression":
                this.term_expression();
                break;
            case "unary_op":
                this.term_unary_op_term();
                break;
            default:
                throw new Error(`Determine term type error, none of conds is true`);
        }
    }
    static term_expression() {
        this.consume('(');
        this.compile_expression();
        this.consume(')');
    }
    static compile_subroutine_call() {
        this.term_subroutine_call();
    }
    static determine_term_type() {
        let isIntConst, isStrConst, isKeywordConst, isVarNameWithArrayAccess, isObjMethodOrStaticFuncCall, isSubroutineCall, isJustVarName, isExpression, isUnaryOp;

        isIntConst = Boolean(this.tokenizer.tokenType() === 'integerConstant');

        isStrConst = Boolean(this.tokenizer.tokenType() === 'stringConstant');

        const tokValMatchesAKeyword = Boolean(["true", "false", "null", "this"].includes(this.tokenizer.tokenValue()));

        isKeywordConst = Boolean(!isStrConst && tokValMatchesAKeyword);

        const nextTokenValue = this.tokenizer.nextTokenValue();

        isVarNameWithArrayAccess = Boolean(this.tokenizer.tokenType() === 'identifier' && nextTokenValue === '[');

        const tokenValueIsUnaryOp = Boolean(["~", "-"].includes(this.tokenizer.tokenValue()));
        isUnaryOp = Boolean(tokenValueIsUnaryOp);

        isSubroutineCall = Boolean(
            !isUnaryOp && this.tokenizer.tokenType() === 'identifier' &&
            (nextTokenValue === '.' || nextTokenValue === '(')
        );

        isExpression = Boolean(this.tokenizer.tokenValue() === '(');



        isJustVarName = Boolean(!(isVarNameWithArrayAccess || isObjMethodOrStaticFuncCall || isSubroutineCall || isExpression || isUnaryOp));

        if (isIntConst) {
            return "int_const";
        } else if (isStrConst) {
            return "str_const";
        } else if (isKeywordConst) {
            return "keyword_const";
        } else if (isJustVarName) {
            return "var_name";
        } else if (isVarNameWithArrayAccess) {
            return "var_name_array_access";
        } else if (isSubroutineCall) {
            return "subroutine_call";
        } else if (isExpression) {
            return "expression";
        } else if (isUnaryOp) {
            return "unary_op";
        } else {
            throw new Error(`Determine term type error, none of conds is true`);
        }
    }

    static term_int_const() {
        Tokens_To_VM_Code_Converter.compile_token_type_and_value();
    }
    static term_str_const() {

        Tokens_To_VM_Code_Converter.compile_token_type_and_value();
    }
    static term_keyword_const() {

        Tokens_To_VM_Code_Converter.compile_token_type_and_value();


    }

    static term_var_name() {
        Tokens_To_VM_Code_Converter.compile_var_name();
    }
    static term_var_name_array_access() {

        Tokens_To_VM_Code_Converter.compile_identifier();
        Tokens_To_VM_Code_Converter.consume('[');
        Tokens_To_VM_Code_Converter.compile_expression();
        Tokens_To_VM_Code_Converter.consume(']');
    }
    static term_subroutine_call() {
        const normalSubroutineCall = Boolean(this.tokenizer.nextTokenValue() === '(');
        if (normalSubroutineCall) {
            this.compile_subroutine_name();
            this.consume('(');
            this.compile_expression_list();
            this.consume(')');
            return;
        }
        const classStaticOrObjCall = Boolean(this.tokenizer.nextTokenValue() === '.');
        if (classStaticOrObjCall) {
            this.compile_class_or_var_name();
            this.consume('.');
            this.compile_subroutine_name();
            this.consume('(');
            this.compile_expression_list();
            this.consume(')');
        }

    }
    static compile_class_or_var_name() {
        this.compile_identifier();
    }
    static term_obj_method_or_static_call() {
        const nextTokenValue = Tokens_To_VM_Code_Converter.tokenizer.nextTokenValue();
        const is_obj_method_or_static_func_call = Boolean(nextTokenValue === '.');
        if (!is_obj_method_or_static_func_call) {
            return false;
        }

        Tokens_To_VM_Code_Converter.compile_identifier(); // class or obj var name
        Tokens_To_VM_Code_Converter.consume('.');
        Tokens_To_VM_Code_Converter.compile_identifier(); // method or static func name
        Tokens_To_VM_Code_Converter.consume('(');
        Tokens_To_VM_Code_Converter.compile_expression_list();
        Tokens_To_VM_Code_Converter.consume(')');

    }
    static term_unary_op_term() {
        Tokens_To_VM_Code_Converter.consume_unary_op();
        this.compile_term();
    }
    static consume_unary_op() {
        this.consume(this.tokenizer.tokenValue());
    }
    static compile_expression_list() {
        this.appendToXML(`<expressionList>`);
        const endOfExpressionListMarker = ')';
        let moreThanZeroExpressions = Boolean(Tokens_To_VM_Code_Converter.tokenizer.tokenValue() !== endOfExpressionListMarker);
        if (!moreThanZeroExpressions) {
            this.appendToXML(`</expressionList>`);
            return;
        }
        Tokens_To_VM_Code_Converter.compile_expression();
        let anyMoreExpressionsLeftToProcess = Boolean(Tokens_To_VM_Code_Converter.tokenizer.tokenValue() === ',');
        while (anyMoreExpressionsLeftToProcess) {
            this.consume(',');
            Tokens_To_VM_Code_Converter.compile_expression();
            anyMoreExpressionsLeftToProcess = Boolean(Tokens_To_VM_Code_Converter.tokenizer.tokenValue() === ',');
        }
        this.appendToXML(`</expressionList>`);
    }

    static consume_constructor_or_function_or_method() {
        const kind = this.tokenizer.tokenValue();

        this.consume(kind);

        return kind;
    }
    static next_token_xml() {
        return `<${Tokens_To_VM_Code_Converter.tokenizer.tokenType()}> ${Tokens_To_VM_Code_Converter.tokenizer.tokenValue()} </${Tokens_To_VM_Code_Converter.tokenizer.tokenType()}>`;
    }
    static consume_field_or_static_keyword() {
        const keyword = this.tokenizer.tokenValue();

        this.consume(keyword);

        return keyword;
    }
    static compile_token_type_and_value() {
        const varTypeXML = `<${Tokens_To_VM_Code_Converter.tokenizer.tokenType()}> ${Tokens_To_VM_Code_Converter.tokenizer.tokenValue()} </${Tokens_To_VM_Code_Converter.tokenizer.tokenType()}>`;
        this.appendToXML(varTypeXML);
        Tokens_To_VM_Code_Converter.tokenizer.advance();
    }
    static compile_zero_or_more_var_decs() {
        let varDecsLeftToProcess;

        varDecsLeftToProcess = Boolean(Tokens_To_VM_Code_Converter.tokenizer.tokenValue() === 'var');

        while (varDecsLeftToProcess) {
            Tokens_To_VM_Code_Converter.compile_var_dec();

            varDecsLeftToProcess = Boolean(Tokens_To_VM_Code_Converter.tokenizer.tokenValue() === 'var');

        }


    }
    static compile_var_dec() {
        this.appendToXML('<varDec>');
        this.consume('var');
        this.compile_var_type();
        this.compile_var_name();
        this.then_zero_or_more_comma_separated_var_decs();
        this.consume(';');
        this.appendToXML('</varDec>');
    }
    static then_zero_or_more_comma_separated_var_decs() {
        let moreCommaSeparatedVarDecs = Boolean(this.tokenizer.tokenValue() === ',');
        while (moreCommaSeparatedVarDecs) {
            this.compile_var_type();
            this.compile_var_name();
            moreCommaSeparatedVarDecs = Boolean(this.tokenizer.tokenValue() === ',');

        }
    }
    static compile_class_var_dec() {

        const kind = Tokens_To_VM_Code_Converter.consume_field_or_static_keyword() as Jack_Symbol["kind"];
        const type = Tokens_To_VM_Code_Converter.compile_var_type();
        const name = Tokens_To_VM_Code_Converter.compile_var_name();
        this.symbol_table.add(name, kind, type);

        this.compile_optional_comma_separated_additional_var_decs_of_same_type();
        this.consume(';');
    }
    static compile_optional_comma_separated_additional_var_decs_of_same_type() {
        let moreRemaining = Boolean(this.tokenizer.tokenValue() === ',');
        while (moreRemaining) {
            this.consume(',');
            const varName = this.compile_var_name();
            this.symbol_table.add(varName);

            moreRemaining = Boolean(this.tokenizer.tokenValue() === ',');
        }
    }
    static compile_var_type() {
        this.compile_token_type_and_value();

        const type = this.tokenizer.tokenValue();
        return type;
    }

    static consume(requiredValue: string) {
        const tokenValue = Tokens_To_VM_Code_Converter.tokenizer.tokenValue();
        const tokenType = Tokens_To_VM_Code_Converter.tokenizer.tokenType();
        if (!(tokenValue === requiredValue)) {
            throw new Error(`Expected the required token value ${requiredValue}, but the actual token has a  different value (${tokenValue})`);
        }
        this.appendToXML(`<${tokenType}> ${tokenValue} </${tokenType}>`);
        Tokens_To_VM_Code_Converter.tokenizer.advance();

    }

    static compile_identifier() {

        const identifier = Tokens_To_VM_Code_Converter.tokenizer.identifierValue();

        Tokens_To_VM_Code_Converter.tokenizer.advance();

        return identifier;

    }

    static compile_subroutine_return_type() {
        this.consume(this.tokenizer.tokenValue());
    }
    static compile_var_name() {
        const var_name = Tokens_To_VM_Code_Converter.compile_identifier();
        return var_name;
    }

}