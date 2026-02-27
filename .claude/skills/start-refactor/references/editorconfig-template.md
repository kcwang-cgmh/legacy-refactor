# .editorconfig Template

建立 `refactored-project/.editorconfig`，確保整個新專案的程式碼風格一致。

此設定與 `dotnet8-conventions.instructions.md` 規則對齊。

## 建立指令

```bash
cd refactored-project
cat > .editorconfig << 'EOF'
# EditorConfig — https://editorconfig.org
root = true

# 所有檔案的通用設定
[*]
charset = utf-8
end_of_line = lf
indent_style = space
insert_final_newline = true
trim_trailing_whitespace = true

# C# 原始碼
[*.cs]
indent_size = 4
max_line_length = 120

# .NET 命名規則 — public/protected/internal 成員使用 PascalCase
dotnet_naming_rule.public_members_should_be_pascal_case.severity = warning
dotnet_naming_rule.public_members_should_be_pascal_case.symbols = public_symbols
dotnet_naming_rule.public_members_should_be_pascal_case.style = pascal_case_style

dotnet_naming_symbols.public_symbols.applicable_kinds = property,method,field,event,delegate
dotnet_naming_symbols.public_symbols.applicable_accessibilities = public,protected,internal

dotnet_naming_style.pascal_case_style.capitalization = pascal_case

# .NET 命名規則 — private 欄位使用 _camelCase
dotnet_naming_rule.private_fields_should_be_camel_case.severity = warning
dotnet_naming_rule.private_fields_should_be_camel_case.symbols = private_fields
dotnet_naming_rule.private_fields_should_be_camel_case.style = underscore_camel_case_style

dotnet_naming_symbols.private_fields.applicable_kinds = field
dotnet_naming_symbols.private_fields.applicable_accessibilities = private,private_protected

dotnet_naming_style.underscore_camel_case_style.capitalization = camel_case
dotnet_naming_style.underscore_camel_case_style.required_prefix = _

# .NET 語言設定
dotnet_style_qualification_for_field = false:suggestion
dotnet_style_qualification_for_property = false:suggestion
dotnet_style_qualification_for_method = false:suggestion
dotnet_style_qualification_for_event = false:suggestion

dotnet_style_predefined_type_for_locals_parameters_members = true:suggestion
dotnet_style_predefined_type_for_member_access = true:suggestion

dotnet_style_object_initializer = true:suggestion
dotnet_style_collection_initializer = true:suggestion
dotnet_style_null_propagation = true:suggestion
dotnet_style_coalesce_expression = true:suggestion

# C# 語言設定
csharp_style_namespace_declarations = file_scoped:warning
csharp_style_prefer_primary_constructors = true:suggestion
csharp_style_var_for_built_in_types = false:suggestion
csharp_style_var_when_type_is_apparent = true:suggestion
csharp_style_var_elsewhere = false:suggestion

csharp_prefer_braces = when_multiline:suggestion
csharp_style_expression_bodied_methods = when_on_single_line:suggestion
csharp_style_expression_bodied_properties = when_on_single_line:suggestion

csharp_new_line_before_open_brace = all
csharp_new_line_before_else = true
csharp_new_line_before_catch = true
csharp_new_line_before_finally = true

csharp_space_after_cast = false
csharp_space_before_colon_in_inheritance_clause = true
csharp_space_after_colon_in_inheritance_clause = true

# 排序 using 指示詞
dotnet_sort_system_directives_first = true
dotnet_separate_import_directive_groups = false

# JSON / YAML / 設定檔
[*.{json,yaml,yml}]
indent_size = 2

# HTML / Razor Views
[*.{html,cshtml,razor}]
indent_size = 4

# TypeScript / JavaScript（若使用前端框架）
[*.{ts,tsx,js,jsx}]
indent_size = 2
max_line_length = 120

# CSS / SCSS
[*.{css,scss}]
indent_size = 2

# Markdown 文件不強制 trim trailing whitespace（Markdown 用兩個空白換行）
[*.md]
trim_trailing_whitespace = false

# XML 專案檔
[*.{csproj,props,targets,xml}]
indent_size = 2
EOF
```

## 驗證設定已生效

```bash
# 確認檔案存在
cat refactored-project/.editorconfig | head -5

# 格式化程式碼並檢查是否符合規範（需要 dotnet-format）
cd refactored-project
dotnet format --verify-no-changes
```

> **注意**：`dotnet format` 在 .NET 6+ SDK 已內建，不需另外安裝。

## 加入初始 Commit

`.editorconfig` 應在 **Phase 1 初始化完成後、第一個 feature commit 之前** 建立並提交：

```bash
cd refactored-project
git add .editorconfig
git commit -m "chore(config): 新增 .editorconfig 統一程式碼風格"
```
