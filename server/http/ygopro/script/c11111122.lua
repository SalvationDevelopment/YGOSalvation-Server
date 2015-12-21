--Respect Synchron
function c11111122.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_TOHAND)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_TO_GRAVE)
	e1:SetCondition(c11111122.condition)
	e1:SetTarget(c11111122.target)
	e1:SetOperation(c11111122.operation)
	c:RegisterEffect(e1)
	--Destroy
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_CONTINUOUS+EFFECT_TYPE_SINGLE)
	e2:SetCode(EVENT_LEAVE_FIELD)
	e2:SetOperation(c11111122.desop)
	c:RegisterEffect(e2)
	--Destroy2
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_CONTINUOUS+EFFECT_TYPE_FIELD)
	e3:SetRange(LOCATION_SZONE)
	e3:SetCode(EVENT_LEAVE_FIELD)
	e3:SetCondition(c11111122.descon2)
	e3:SetOperation(c11111122.desop2)
	c:RegisterEffect(e3)
end
function c11111122.desop(e,tp,eg,ep,ev,re,r,rp)
	local tc=e:GetHandler():GetFirstCardTarget()
	if tc and tc:IsLocation(LOCATION_MZONE) then
		Duel.Destroy(tc,REASON_EFFECT)
	end
end
function c11111122.descon2(e,tp,eg,ep,ev,re,r,rp)
	local tc=e:GetHandler():GetFirstCardTarget()
	return tc and eg:IsContains(tc)
end
function c11111122.desop2(e,tp,eg,ep,ev,re,r,rp)
	Duel.Destroy(e:GetHandler(),REASON_EFFECT)
end
function c11111122.cfilter(c,tp)
	return c:IsType(TYPE_SYNCHRO) and c:IsPreviousLocation(LOCATION_ONFIELD) and c:IsPreviousPosition(POS_FACEUP)
		and c:IsControler(1-tp) and c:GetPreviousControler()~=tp and c:GetReasonPlayer()~=tp
end
function c11111122.condition(e,tp,eg,ep,ev,re,r,rp)
	return eg:IsExists(c11111122.cfilter,1,nil,tp)
end
function c11111122.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return false end
	if chk==0 then return eg:GetFirst():IsCanBeEffectTarget(e) end
	Duel.SetTargetCard(eg)
	Duel.SetOperationInfo(0,CATEGORY_CONTROL,eg,1,0,0)
end
function c11111122.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if c:IsRelateToEffect(e) and tc:IsRelateToEffect(e) then
		if Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP_ATTACK)==0 then return end
		c:SetCardTarget(tc)
	end
end