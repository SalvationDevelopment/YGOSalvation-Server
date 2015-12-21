--ライトロード・アサシン ライデン
--TCG Version
function c80300003.initial_effect(c)
	--atkup
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80300003,0))
	e1:SetCategory(CATEGORY_ATKCHANGE+CATEGORY_DECKDES)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1)
	e1:SetCost(c80300003.cost)
	e1:SetTarget(c80300003.target)
	e1:SetOperation(c80300003.operation)
	c:RegisterEffect(e1)
	--discard deck
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80300003,0))
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e2:SetProperty(EFFECT_FLAG_REPEAT)
	e2:SetCategory(CATEGORY_DECKDES)
	e2:SetCode(EVENT_PHASE+PHASE_END)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCountLimit(1)
	e2:SetCondition(c80300003.discon)
	e2:SetTarget(c80300003.distg)
	e2:SetOperation(c80300003.disop)
	c:RegisterEffect(e2)
end
function c80300003.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80300003)==0 end
	Duel.RegisterFlagEffect(tp,80300003,RESET_PHASE+PHASE_END,0,1)
end
function c80300003.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsPlayerCanDiscardDeck(tp,2) end
	Duel.SetOperationInfo(0,CATEGORY_DECKDES,nil,0,tp,2)
end
function c80300003.cfilter(c)
	return c:IsLocation(LOCATION_GRAVE) and c:IsSetCard(0x38) and c:IsType(TYPE_MONSTER)
end
function c80300003.operation(e,tp,eg,ep,ev,re,r,rp)
	Duel.DiscardDeck(tp,2,REASON_EFFECT)
	local g=Duel.GetOperatedGroup()
	local ct=g:FilterCount(c80300003.cfilter,nil)
	if ct==0 then return end
	local c=e:GetHandler()
	if c:IsFaceup() and c:IsRelateToEffect(e) then
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_UPDATE_ATTACK)
		e1:SetValue(200)
		e1:SetReset(RESET_EVENT+0x1ff0000+RESET_PHASE+PHASE_END,2)
		c:RegisterEffect(e1)
	end
end
function c80300003.discon(e,tp,eg,ep,ev,re,r,rp)
	return tp==Duel.GetTurnPlayer()
end
function c80300003.distg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_DECKDES,nil,0,tp,2)
end
function c80300003.disop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:GetControler()~=tp or not c:IsRelateToEffect(e) or c:IsFacedown() then return end
	Duel.DiscardDeck(tp,2,REASON_EFFECT)
end
