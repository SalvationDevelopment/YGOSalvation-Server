--Deuce
function c12381.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCondition(c12381.condition)
	c:RegisterEffect(e1)
	--Counter 1
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(12381,0))
	e2:SetCategory(CATEGORY_RECOVER)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCode(EVENT_DAMAGE)
	e2:SetCondition(c12381.addcon)
	e2:SetTarget(c12381.addct)
	e2:SetOperation(c12381.addc)
	c:RegisterEffect(e2)
	--Counter 2
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(12381,0))
	e3:SetCategory(CATEGORY_RECOVER)
	e3:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e3:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e3:SetRange(LOCATION_SZONE)
	e3:SetCode(EVENT_DAMAGE)
	e3:SetCondition(c12381.addcon2)
	e3:SetTarget(c12381.addct2)
	e3:SetOperation(c12381.addc2)
	c:RegisterEffect(e3)
	--Counter 3
	local e4=Effect.CreateEffect(c)
	e4:SetDescription(aux.Stringid(12381,0))
	e4:SetCategory(CATEGORY_RECOVER)
	e4:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e4:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e4:SetRange(LOCATION_SZONE)
	e4:SetCode(EVENT_DAMAGE)
	e4:SetCondition(c12381.xaddcon)
	e4:SetTarget(c12381.addct)
	e4:SetOperation(c12381.addc)
	c:RegisterEffect(e4)	
	--Counter 4
	local e5=Effect.CreateEffect(c)
	e5:SetDescription(aux.Stringid(12381,0))
	e5:SetCategory(CATEGORY_RECOVER)
	e5:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e5:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e5:SetRange(LOCATION_SZONE)
	e5:SetCode(EVENT_DAMAGE)
	e5:SetCondition(c12381.xaddcon2)
	e5:SetTarget(c12381.addct2)
	e5:SetOperation(c12381.addc2)
	c:RegisterEffect(e5)
	--cannot attack
	local e6=Effect.CreateEffect(c)
	e6:SetType(EFFECT_TYPE_FIELD)
	e6:SetProperty(EFFECT_FLAG_IGNORE_IMMUNE)
	e6:SetCode(EFFECT_CANNOT_ATTACK_ANNOUNCE)
	e6:SetRange(LOCATION_SZONE)
	e6:SetTargetRange(LOCATION_MZONE,LOCATION_MZONE)
	e6:SetCondition(c12381.atkcon)
	e6:SetTarget(c12381.atktg)
	c:RegisterEffect(e6)
	--check
	local e7=Effect.CreateEffect(c)
	e7:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e7:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
	e7:SetCode(EVENT_ATTACK_ANNOUNCE)
	e7:SetRange(LOCATION_SZONE)
	e7:SetOperation(c12381.checkop)
	e7:SetLabelObject(e7)
	c:RegisterEffect(e7)
end
function c12381.cfilter(c)
	return c:IsFaceup() and c:IsCode(12379)
end
function c12381.addcon(e,tp,eg,ep,ev,re,r,rp)
	if ep==tp or r~=REASON_BATTLE then return false end
	local rc=eg:GetFirst()
	return rc:IsControler(tp)
end
function c12381.xaddcon(e,tp,eg,ep,ev,re,r,rp)
	return ep~=tp and bit.band(r,REASON_EFFECT)~=0
end
function c12381.addct(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_COUNTER,nil,1,0,0x50)
end
function c12381.addc(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if e:GetHandler():IsRelateToEffect(e) then
		e:GetHandler():AddCounter(0x50,1)
		e:GetHandler():RemoveCounter(tp,0x51,1,REASON_EFFECT)
	end
	if c:GetCounter(0x50)>=2 then
		Duel.Win(tp,0x49)
	end		
end
function c12381.addcon2(e,tp,eg,ep,ev,re,r,rp)
	if ep~=tp or r~=REASON_BATTLE then return false end
	local rc=eg:GetFirst()
	return rc:IsControler(1-tp)
end
function c12381.xaddcon2(e,tp,eg,ep,ev,re,r,rp)
	return ep==tp and bit.band(r,REASON_EFFECT)~=0
end
function c12381.addct2(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_COUNTER,nil,1,0,0x51)
end
function c12381.addc2(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if e:GetHandler():IsRelateToEffect(e) then
		e:GetHandler():AddCounter(0x51,1)
		e:GetHandler():RemoveCounter(tp,0x50,1,REASON_EFFECT)
	end
	if c:GetCounter(0x51)>=2 then
		Duel.Win(1-tp,0x49)
	end	
end
function c12381.atkcon(e)
	return e:GetHandler():GetFlagEffect(12381)~=0
end
function c12381.atktg(e,c)
	return c:GetFieldID()~=e:GetLabel()
end
function c12381.checkop(e,tp,eg,ep,ev,re,r,rp)
	if e:GetHandler():GetFlagEffect(c12381)~=0 then return end
	local fid=eg:GetFirst():GetFieldID()
	e:GetHandler():RegisterFlagEffect(12381,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
	e:GetLabelObject():SetLabel(fid)
end
function c12381.condition(e,tp,eg,ep,ev,re,r,rp)
	if Duel.IsExistingMatchingCard(c12381.cfilter,tp,LOCATION_ONFIELD,0,1,nil) then return Duel.GetLP(tp)-Duel.GetLP(1-tp)==0 or Duel.GetLP(1-tp)-Duel.GetLP(tp)==0 end

end