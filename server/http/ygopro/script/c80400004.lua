--ＥＭヘイタイガー
function c80400004.initial_effect(c)
	--search
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80400004,0))
	e1:SetCategory(CATEGORY_TOHAND+CATEGORY_SEARCH)
	e1:SetCode(EVENT_BATTLE_DESTROYING)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e1:SetCountLimit(1,80400004)
	e1:SetCondition(c80400004.scon)
	e1:SetTarget(c80400004.stg)
	e1:SetOperation(c80400004.sop)
	c:RegisterEffect(e1)
end
function c80400004.scon(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local a=Duel.GetAttacker()
	local d=Duel.GetAttackTarget()
	if a~=c then d=a end
	return c:IsRelateToBattle() and c:IsFaceup()
		and d and d:GetLocation()==LOCATION_GRAVE and d:IsType(TYPE_MONSTER)
end
function c80400004.sfilter(c)
	return c:IsSetCard(0x9f) and c:IsType(TYPE_PENDULUM) and c:IsAbleToHand()
end
function c80400004.stg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c80400004.sfilter,tp,LOCATION_DECK,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,0,0)
end
function c80400004.sop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectMatchingCard(tp,c80400004.sfilter,tp,LOCATION_DECK,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end