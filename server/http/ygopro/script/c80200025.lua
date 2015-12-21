--セイバー・リフレクト
function c80200025.initial_effect(c)
	--special summon
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_RECOVER+CATEGORY_DAMAGE+CATEGORY_TOHAND+CATEGORY_SEARCH)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_DAMAGE)
	e1:SetCountLimit(1,80200025+EFFECT_COUNT_CODE_OATH)
	e1:SetCondition(c80200025.condition)
	e1:SetTarget(c80200025.target)
	e1:SetOperation(c80200025.activate)
	c:RegisterEffect(e1)
end
function c80200025.filter(c)
	return c:IsFaceup() and c:IsSetCard(0x100d)
end
function c80200025.condition(e,tp,eg,ep,ev,re,r,rp)
	return ep==tp and bit.band(r,REASON_EFFECT)~=0
			and Duel.IsExistingMatchingCard(c80200025.filter,tp,LOCATION_MZONE,0,1,nil)
end
function c80200025.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,e:GetHandler(),1,0,0)
	Duel.SetOperationInfo(0,CATEGORY_RECOVER,nil,0,tp,ev)
	Duel.SetOperationInfo(0,CATEGORY_DAMAGE,nil,0,1-tp,ev)
end
function c80200025.thfilter(c)
	return (c:IsSetCard(0xd) and c:IsType(TYPE_SPELL+TYPE_TRAP) or c:IsSetCard(0xb0)) and c:IsAbleToHand()
end
function c80200025.activate(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local ct=Duel.Recover(tp,ev,REASON_EFFECT)
	local ct1=Duel.Damage(1-tp,ev,REASON_EFFECT)

	if ct+ct1 >0 and Duel.IsExistingMatchingCard(c80200025.thfilter,tp,LOCATION_DECK,0,1,nil)
		and Duel.SelectYesNo(tp,aux.Stringid(80200025,0))
	then 
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
		local g=Duel.SelectMatchingCard(tp,c80200025.thfilter,tp,LOCATION_DECK,0,1,1,nil)
		if g:GetCount()>0 then
			Duel.SendtoHand(g,nil,REASON_EFFECT)
			Duel.ConfirmCards(1-tp,g)
		end
	end
end