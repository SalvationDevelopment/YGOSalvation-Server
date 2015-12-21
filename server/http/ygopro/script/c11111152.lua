--Parasite Mind
function c11111152.initial_effect(c)
	--copy trap
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetHintTiming(0x1e1,0x1e1)
	e1:SetCondition(c11111152.condition)
	e1:SetTarget(c11111152.target)
	e1:SetOperation(c11111152.operation)
	c:RegisterEffect(e1)
end
function c11111152.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetTurnPlayer()~=tp and Duel.GetCurrentPhase()<PHASE_MAIN2
end
function c11111152.filter(c,e,tp,eg,ep,ev,re,r,rp)
	return c:GetType()==0x20004 or c:GetType()==0x20002 and not c:IsCode(11111152) and c:CheckActivateEffect(false,true,false)~=nil
end
function c11111152.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then
		local te=e:GetLabelObject()
		local tg=te:GetTarget()
		return tg and tg(e,tp,eg,ep,ev,re,r,rp,1,true)
	end
	if chk==0 then return Duel.IsExistingTarget(c11111152.filter,tp,0,LOCATION_SZONE,1,nil) end
	e:SetProperty(EFFECT_FLAG_CARD_TARGET)
	Duel.Hint(HINT_SELECTMSG,tp,aux.Stringid(11111152,0))
	local g=Duel.SelectTarget(tp,c11111152.filter,tp,0,LOCATION_SZONE,1,1,nil)
	local te,eg,ep,ev,re,r,rp=g:GetFirst():CheckActivateEffect(false,true,true)
	e:SetLabelObject(te)
	Duel.ClearTargetCard()
	local tg=te:GetTarget()
	e:SetCategory(te:GetCategory())
	e:SetProperty(te:GetProperty())
	if tg then tg(e,tp,eg,ep,ev,re,r,rp,1) end
end
function c11111152.operation(e,tp,eg,ep,ev,re,r,rp)
	local te=e:GetLabelObject()
	if not te then return end
	local op=te:GetOperation()
	if op then op(e,tp,eg,ep,ev,re,r,rp) end
end
