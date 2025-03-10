import React, { useState, useRef } from 'react'

import PropTypes from 'prop-types'
import { MdFileUpload } from '../../assets/icons'
import styled, { css, DefaultTheme } from 'styled-components'

import { Flex } from '../Flex'
import { Text } from '../Text'
import { Icon } from '../Icon'

interface TypeTranslate {
  message: {
    row1: string
    row2: string
  }
  errorSize: string
  errorType: string
}

export interface Props {
  dataMaxSize?: number
  onChange?: (e: any) => void
  initImage?: string
  name?: string
  onVerifyType?: any
  translate?: TypeTranslate

  width?: number | string
  maxWidth?: number | string
  errorMessage?: string
  errorForm?: boolean
}

const translateDefault = {
  message: {
    row1: 'arraste e solte a imagem aqui',
    row2: 'ou clique para escolher'
  },
  errorSize: 'hey! a imagem é muito grande, escolha uma imagem menor',
  errorType: 'hey! apenas os tipos de png e jpeg são aceitos'
}

interface ContainerProps extends DefaultTheme {
  error?: any
  isDragover?: boolean
}

const Container = styled(Flex) <ContainerProps>`
  border: 1px solid
    ${({ error, theme }) =>
    error ? theme.colors.red : theme.colors.mediumGrey};

  position: relative;
  &:hover {
    cursor: pointer;
  }

  ${({ isDragover }) =>
    isDragover &&
    css`
      background: #f5f5f5;
      border: 1px dashed #babcbe;
    `}
`

interface InputFileProps {
  ref: any
}

const InputFile = styled.input<InputFileProps>`
  display: none;
`

const Image = styled.img`
  width: calc(100% - 5%);
  height: 180px;

  border-radius: 6px;
  position: absolute;
`

export const DropFile = React.forwardRef<HTMLInputElement, Props>(
  (
    {
      translate = translateDefault,
      dataMaxSize = 2048,
      initImage,
      name,
      errorMessage,
      errorForm,
      onChange,
      onVerifyType,
      ...props
    },
    ref
  ) => {
    const [isDragover, setIsDragover] = useState(false)
    const [image, setImage] = useState<any>()
    const [typeError, setTypeError] = useState<null | string>()

    const inputRef = useRef(document.createElement('input'))

    function handleDropFiles(e) {
      e.preventDefault()
      e.stopPropagation()
      setIsDragover(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onChange && onChange(e.dataTransfer.files)
        inputRef.current.files = e.dataTransfer.files

        setImageByFile(e.dataTransfer.files[0])
      }
    }

    function handleClickBox() {
      inputRef.current.click()
    }

    function removeDragover(e) {
      e.preventDefault()
      e.stopPropagation()
      setIsDragover(false)
    }

    function addDragover(e) {
      e.preventDefault()
      e.stopPropagation()
      setIsDragover(true)
    }

    function handleChangeImage(e) {
      const input = e.target
      onChange && onChange(input.files)
      if (input.files && input.files[0]) {
        setImageByFile(input.files[0])
      }
    }

    function setImageByFile(file) {
      if (verifySize(file) && verifyType(file)) {
        const reader = new FileReader()

        reader.onload = e => {
          if (e?.target) {
            setImage(e?.target?.result)
          }
        }

        reader.readAsDataURL(file) // convert to base64 string
        return
      }
      setImage(null)
    }

    function verifySize(file) {
      const kbytes = file.size / 1000
      if (kbytes < dataMaxSize) {
        setTypeError(null)
        return true
      }
      setTypeError('size')
      return false
    }

    function verifyType(file) {
      if (onVerifyType) {
        if (onVerifyType(file)) {
          setTypeError(null)
          return true
        }
      } else if (file.type === 'image/jpeg' || file.type === 'image/png') {
        setTypeError(null)
        return true
      }

      setTypeError('type')
      return false
    }

    function getErrorMessage() {
      if (typeError === 'type') {
        return translate.errorType
      }

      if (typeError === 'size') {
        return translate.errorSize
      }
      if (errorForm) {
        return errorMessage
      }
      return null
    }

    const ImageFile: React.FC = () => {
      if (initImage && !image && !isDragover) {
        return (
          <Image
            width='100%'
            height='200px'
            src={initImage}
            alt='your image'
            data-testid='dropfile-image'
          />
        )
      }
      if (image && !isDragover) {
        return (
          <Image
            src={image}
            width='100%'
            height='200px'
            alt='your image'
            data-testid='dropfile-image'
          />
        )
      }
      return <Flex />
    }

    return (
      <Container
        error={typeError || errorForm}
        isDragover={isDragover}
        onDragOver={addDragover}
        onDragEnter={addDragover}
        onDragLeave={removeDragover}
        onDragEnd={removeDragover}
        onDrop={handleDropFiles}
        onClick={handleClickBox}
        height='200px'
        variant='centralized'
        borderRadius={6}
        data-testid='dropfile-container'
        {...props}
      >
        <InputFile
          name={name}
          onChange={handleChangeImage}
          ref={inputRef}
          type='file'
          data-testid='dropfile-input'
          {...props}
        />
        <Flex flexDirection='column' variant='centralized'>
          <Icon color='grey' mb={'12px'}>
            <MdFileUpload size={48} />
          </Icon>
          <Text color='grey'>{translate.message.row1}</Text>
          <Text color='grey'>{translate.message.row2}</Text>
          <Text
            mt={4}
            color='red'
            fontWeight='medium'
            data-testid='dropfile-error'
          >
            {getErrorMessage()}
          </Text>
          <ImageFile />
        </Flex>
      </Container>
    )
  }
)

DropFile.displayName = 'DropFile'

DropFile.propTypes = {
  dataMaxSize: PropTypes.number,
  translate: PropTypes.any,
  onChange: PropTypes.func,
  initImage: PropTypes.string,
  errorMessage: PropTypes.string,
  errorForm: PropTypes.bool,
  onVerifyType: PropTypes.func,
  name: PropTypes.string
}
