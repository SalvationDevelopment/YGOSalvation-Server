--Phantom Deathspear
--By: HelixReactor
function c98153934.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--damage
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e2:SetCode(EVENT_CHAINING)
	e2:SetRange(LOCATION_SZONE)
	e2:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
	e2:SetCondition(c98153934.regcon)
	e2:SetOperation(c98153934.regop)
	c:RegisterEffect(e2)
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e3:SetCode(EVENT_CHAIN_SOLVED)
	e3:SetRange(LOCATION_SZONE)
	e3:SetCondition(c98153934.damcon)
	e3:SetOperation(c98153934.damop)
	c:RegisterEffect(e3)
	--destroy replace
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e4:SetCode(EFFECT_DESTROY_REPLACE)
	e4:SetRange(LOCATION_GRAVE)
	e4:SetTarget(c98153934.reptg)
	e4:SetValue(c98153934.repval)
	e4:SetOperation(c98153934.repop)
	c:RegisterEffect(e4)
end
function c98153934.regcon(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if not re:IsHasProperty(EFFECT_FLAG_CARD_TARGET) then return false end
	local tg=Duel.GetChainInfo(ev,CHAININFO_TARGET_CARDS)
	local tgc=false
	local tc=tg:GetFirst()
	while tc do
		if tc:IsSetCard(0x1373) and tc:IsType(TYPE_MONSTER) and tc:IsControler(tp) then tgc=true end
		tc=tg:GetNext()
	end
	return ep~=tp and tgc
end
function c98153934.regop(e,tp,eg,ep,ev,re,r,rp)
	e:GetHandler():RegisterFlagEffect(98153934,RESET_EVENT+0x1fc0000+RESET_CHAIN,0,1)
end
function c98153934.damcon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetFlagEffect(98153934)~=0
end
function c98153934.damop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_CARD,0,98153934)
	Duel.Damage(1-tp,500,REASON_EFFECT)
end
function c98153934.repfilter(c,tp)
	return c:IsFaceup() and c:IsAttribute(ATTRIBUTE_DARK)
		and c:IsOnField() and c:IsControler(tp) and c:IsReason(REASON_EFFECT+REASON_BATTLE) and c:GetReasonPlayer()==1-tp
end
function c98153934.reptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsAbleToRemove() and eg:IsExists(c98153934.repfilter,1,nil,tp) end
	return Duel.SelectYesNo(tp,aux.Stringid(98153934,0))
end
function c98153934.repval(e,c)
	return c98153934.repfilter(c,e:GetHandlerPlayer())
end
function c98153934.repop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Remove(e:GetHandler(),POS_FACEUP,REASON_EFFECT)
end