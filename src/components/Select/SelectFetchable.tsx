import React, { ReactElement, useEffect, useState } from 'react'
import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'
import { useCombobox } from 'downshift'
import { IoIosArrowDown } from '../../assets/icons'

import { Box, Props as BoxPros } from '../Box'
import { Input } from '../Input'
import { Loading } from '../Loading'
import { Button, Props as ButtonProps } from '../Button'

export interface Props extends BoxPros {
  label?: string
  items?: Array<string | { id: any; name: any; select?: any }>
  isOpen?: boolean
  variant?: 'outlined'
  prefix?: any
  placeholder?: string
  handleSelectedItemChange?: (item: any) => void
  onChangeTextInput?: (text: string) => void
  selectedItem?: any
  autoComplete?: boolean
  sufix?: any
  isLoading?: boolean
  errorMessage?: string
  errorForm?: boolean
  onChange?: any
  loadingMessage?: string
  emptyMessage?: string
  emptyElement?: ReactElement
  inputProps?: any
  isDependent?: boolean
  dependentMessage?: string
}

const Container = styled(Box) <Props>`
  position: relative;

  input {
    cursor: auto;
    padding-right: 30px;
  }

  ul {
    box-shadow: 0px 3px 6px #00000029;
    background: ${({ theme }) => theme.colors.white};
    border: 1px solid ${({ theme }) => theme.colors.lightGrey};
    list-style-type: none;
    position: absolute;
    top: ${({ variant }) => (variant === 'outlined' ? '39px' : '38px')};
    overflow: hidden;
    z-index: 1;
    min-width: 100%;
    width: max-content;
    padding: 0;
    margin: 0;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    max-height: 300px;
    overflow-y: auto;

    li {
      cursor: pointer;
      padding: 6px 12px;
    }

    ${({ isOpen }) =>
    !isOpen &&
    css`
        display: none;
      `}
  }
`
interface ItemProps {
  highlighted?: boolean
}

const Item = styled.li<ItemProps>`
  background: ${({ highlighted, theme }) =>
    highlighted ? theme.colors.primaryLight : '#fff'};
`

interface VariantSelect extends ButtonProps {
  variantSelect?: any
}

const ButtonStyled = styled(Button) <VariantSelect>`
  position: absolute;
  top: ${({ variantSelect }) =>
    variantSelect === 'outlined' ? '13px' : '12px'};
  right: 14px;
`

const LoadingBox = styled(Box) <VariantSelect>`
  position: absolute;
  top: ${({ variantSelect }) =>
    variantSelect === 'outlined' ? '13px' : '12px'};
  right: 14px;
`

export const SelectFetchable: React.FC<Props> = ({
  label,
  variant,
  items = [],
  placeholder,
  selectedItem,
  autoComplete = true,
  sufix,
  isLoading,
  errorMessage,
  errorForm,
  onChange,
  isDependent = false,
  dependentMessage = 'este campo tem alguma dependência',
  loadingMessage = 'carregando...',
  emptyMessage = 'item não encontrado',
  emptyElement,
  handleSelectedItemChange = () => {
    // do nothing.
  },
  onChangeTextInput = () => {
    // do nothing.
  },
  prefix,
  inputProps,
  ...props
}) => {
  const [inputItems, setInputItems] = useState(items)

  useEffect(() => setInputItems(items), [items])

  const { backgroundColor, border, width, maxWidth } = props
  const boxStyled = {
    backgroundColor,
    border,
    width,
    maxWidth,
    ...inputProps
  }

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getToggleButtonProps,
    openMenu,
    getItemProps,
    setInputValue
  } = useCombobox({
    onSelectedItemChange: handleSelectedItemChange,
    items: isDependent ? [] : inputItems,
    selectedItem,
    itemToString: item => (typeof item === 'string' ? item : item.name),
    onInputValueChange: ({ inputValue = '' }) => {
      if (autoComplete && typeof inputValue === 'string') {
        onChangeTextInput(inputValue)
        onChange(inputValue)

        setInputItems(
          items.filter(item => {
            const name =
              typeof item === 'string' ? item : item.select || item.name
            return name.toLowerCase().startsWith(inputValue.toLowerCase())
          })
        )
      }
    }
  })

  function handleClickInput() {
    setInputItems(items)
    if (!isOpen) {
      setInputValue('')
      openMenu()
    }
  }

  return (
    <Container
      isOpen={isOpen}
      variant={variant}
      data-testid='select-fechable'
      {...props}
    >
      <ul {...getMenuProps()}>
        {isOpen &&
          inputItems &&
          !isLoading &&
          !isDependent &&
          inputItems.length > 0 &&
          inputItems.map((item, index) => (
            <Item
              key={index}
              data-testid='select-item'
              highlighted={highlightedIndex === index}
              {...getItemProps({ item, index })}
            >
              {typeof item === 'string' ? item : item.name}
            </Item>
          ))}

        {isOpen && isLoading && !isDependent && <Item>{loadingMessage}</Item>}

        {isOpen &&
          inputItems &&
          !isLoading &&
          !isDependent &&
          !emptyElement &&
          inputItems.length === 0 && <Item>{emptyMessage}</Item>}

        {isOpen &&
          inputItems &&
          !isLoading &&
          !isDependent &&
          emptyElement &&
          inputItems.length === 0 &&
          (getInputProps().value ? (
            <Item>{emptyElement}</Item>
          ) : (
            <Item>{emptyMessage}</Item>
          ))}

        {isDependent && <Item>{dependentMessage}</Item>}
      </ul>

      <Box refBox={getComboboxProps().ref}>
        <Input
          onChange={getInputProps().onChange}
          onBlur={getInputProps().onBlur}
          onKeyDown={getInputProps().onKeyDown}
          onClick={handleClickInput}
          value={getInputProps().value}
          inputRef={getInputProps().ref}
          variant={variant}
          label={label}
          errorMessage={errorMessage}
          errorForm={errorForm}
          readOnly={!autoComplete}
          prefix={prefix}
          placeholder={placeholder}
          nativeAutoComplete='disabled'
          {...boxStyled}
        />
        {isLoading && (
          <LoadingBox>
            <Loading size='small' />
          </LoadingBox>
        )}
        {inputItems && !isLoading && (
          <ButtonStyled
            type='button'
            palette='primary'
            variantSelect={variant}
            onClick={getToggleButtonProps().onClick}
            refButton={getToggleButtonProps().ref}
            aria-label='toggle menu'
          >
            {sufix || <IoIosArrowDown />}
          </ButtonStyled>
        )}
      </Box>
    </Container>
  )
}

SelectFetchable.propTypes = {
  label: PropTypes.string,
  items: PropTypes.array,
  isOpen: PropTypes.bool,
  variant: PropTypes.oneOf(['outlined']),
  prefix: PropTypes.any,
  placeholder: PropTypes.string,
  handleSelectedItemChange: PropTypes.func,
  onChangeTextInput: PropTypes.func,
  selectedItem: PropTypes.any,
  autoComplete: PropTypes.bool,
  backgroundColor: PropTypes.any,
  border: PropTypes.any,
  width: PropTypes.any,
  maxWidth: PropTypes.any,
  sufix: PropTypes.any,
  isLoading: PropTypes.bool,
  errorForm: PropTypes.bool,
  errorMessage: PropTypes.string,
  onChange: PropTypes.func,
  inputProps: PropTypes.object,
  isDependent: PropTypes.bool,
  dependentMessage: PropTypes.string,
  emptyMessage: PropTypes.string,
  emptyElement: PropTypes.element,
  loadingMessage: PropTypes.string
}

SelectFetchable.defaultProps = {
  items: []
}
