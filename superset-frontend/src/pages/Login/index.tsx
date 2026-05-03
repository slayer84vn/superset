/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { t } from '@apache-superset/core/translation';
import { SupersetClient } from '@superset-ui/core';
import { styled, css } from '@apache-superset/core/theme';
import {
  Button,
  Card,
  Flex,
  Form,
  Input,
  Typography,
  Icons,
} from '@superset-ui/core/components';
import { useState, useEffect, useMemo } from 'react';
import { capitalize } from 'lodash/fp';
import { addDangerToast } from 'src/components/MessageToasts/actions';
import { useDispatch } from 'react-redux';
import getBootstrapData from 'src/utils/getBootstrapData';

type OAuthProvider = {
  name: string;
  icon: string;
};

type OIDProvider = {
  name: string;
  url: string;
};

type Provider = OAuthProvider | OIDProvider;

interface LoginForm {
  username: string;
  password: string;
}

enum AuthType {
  AuthOID = 0,
  AuthDB = 1,
  AuthLDAP = 2,
  AuthOauth = 4,
  AuthSAML = 5,
}

const StyledCard = styled(Card)`
  ${({ theme }) => css`
    max-width: 400px;
    width: 100%;
    margin-top: ${theme.marginXL}px;
    color: ${theme.colorBgContainer};
    background: ${theme.colorBgBase};
    .ant-form-item-label label {
      color: ${theme.colorPrimary};
    }
  `}
`;

const StyledLabel = styled(Typography.Text)`
  ${({ theme }) => css`
    font-size: ${theme.fontSizeSM}px;
  `}
`;

export default function Login() {
  const [form] = Form.useForm<LoginForm>();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const bootstrapData = getBootstrapData();
  const nextUrl = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('next') || '';
    } catch (_error) {
      return '';
    }
  }, []);

  const loginEndpoint = useMemo(
    () => (nextUrl ? `/login/?next=${encodeURIComponent(nextUrl)}` : '/login/'),
    [nextUrl],
  );

  const buildProviderLoginUrl = (providerName: string) => {
    const base = `/login/${providerName}`;
    return nextUrl
      ? `${base}${base.includes('?') ? '&' : '?'}next=${encodeURIComponent(nextUrl)}`
      : base;
  };

  const authType: AuthType = bootstrapData.common.conf.AUTH_TYPE;
  const providers: Provider[] = bootstrapData.common.conf.AUTH_PROVIDERS;
  const authRegistration: boolean =
    bootstrapData.common.conf.AUTH_USER_REGISTRATION;

  useEffect(() => {
    const loginAttempted = sessionStorage.getItem('login_attempted');

    if (loginAttempted === 'true') {
      sessionStorage.removeItem('login_attempted');
      dispatch(addDangerToast(t('Invalid username or password')));
      form.setFieldsValue({ password: '' });
    }
  }, [dispatch, form]);

  const onFinish = (values: LoginForm) => {
    setLoading(true);
    sessionStorage.setItem('login_attempted', 'true');
    SupersetClient.postForm(loginEndpoint, values, '');
  };

  const getAuthIconElement = (
    providerName: string,
  ): React.JSX.Element | undefined => {
    if (!providerName || typeof providerName !== 'string') {
      return undefined;
    }
    const iconComponentName = `${capitalize(providerName)}Outlined`;
    const IconComponent = (Icons as Record<string, React.ComponentType<any>>)[
      iconComponentName
    ];

    if (IconComponent && typeof IconComponent === 'function') {
      return <IconComponent />;
    }
    return undefined;
  };

  return (
    <div
      css={css`
        width: 100%;
        min-height: 100vh;
        background: linear-gradient(rgba(0, 75, 135, 0.8), rgba(0, 130, 200, 0.8)),
          url('https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=1920&q=80');
        background-size: cover;
        background-position: center;
        display: flex;
        justify-content: center;
        align-items: center;
      `}
    >
      <StyledCard
        css={css`
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          padding: 24px;
        `}
      >
        <Flex vertical align="center" gap="large">
          <img
            src="/static/assets/images/logo.svg"
            alt="VietinBank"
            css={css`
              width: 240px;
              margin-bottom: 8px;
            `}
          />
          <Typography.Title level={4} css={css`margin: 0 !important; font-weight: 700; color: #004b87;`}>
            {t('Login to Dashboard')}
          </Typography.Title>
        </Flex>

        <div css={css`margin-top: 32px;`}>
          {(authType === AuthType.AuthDB || authType === AuthType.AuthLDAP) && (
            <Form
              layout="vertical"
              form={form}
              onFinish={onFinish}
              size="large"
            >
              <Form.Item<LoginForm>
                label={t('Username')}
                name="username"
                rules={[{ required: true, message: t('Please enter your username') }]}
              >
                <Input
                  prefix={<Icons.UserOutlined />}
                  placeholder={t('Enter your username')}
                />
              </Form.Item>
              <Form.Item<LoginForm>
                label={t('Password')}
                name="password"
                rules={[{ required: true, message: t('Please enter your password') }]}
              >
                <Input.Password
                  prefix={<Icons.KeyOutlined />}
                  placeholder={t('Enter your password')}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  block
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  css={css`
                    height: 48px;
                    font-weight: 700;
                    background: #0082c8;
                    &:hover {
                      background: #004b87;
                    }
                  `}
                >
                  {t('LOGIN')}
                </Button>
              </Form.Item>
            </Form>
          )}

          {(authType === AuthType.AuthOID || 
            authType === AuthType.AuthOauth || 
            authType === AuthType.AuthSAML) && (
            <Flex vertical gap="middle">
                {providers.map((provider: Provider) => (
                  <Button
                    key={provider.name}
                    href={buildProviderLoginUrl(provider.name)}
                    block
                    icon={getAuthIconElement(provider.name)}
                  >
                    {t('Sign in with')} {capitalize(provider.name)}
                  </Button>
                ))}
            </Flex>
          )}
        </div>
      </StyledCard>
    </div>
  );
}
