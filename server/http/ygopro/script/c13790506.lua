--Infernoid Dekatron
function c13790506.initial_effect(c)
	--tohand
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(93368494,1))
	e1:SetCategory(CATEGORY_TOHAND)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DELAY)
	e1:SetCode(EVENT_SUMMON_SUCCESS)
	e1:SetTarget(c13790506.target)
	e1:SetOperation(c13790506.operation)
	c:RegisterEffect(e1)
	local e2=e1:Clone()
	e2:SetCode(EVENT_SPSUMMON_SUCCESS)
	c:RegisterEffect(e2)
end
function c13790506.filter(c)
	return c:IsSetCard(0xbb)
end
function c13790506.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_DECK) and chkc:IsControler(tp) and c13790506.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c13790506.filter,tp,LOCATION_DECK,0,1,nil) end
end
function c13790506.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g=Duel.SelectMatchingCard(tp,c13790506.filter,tp,LOCATION_DECK,0,1,1,nil)
	local tc=g:GetFirst()
	if c:IsRelateToEffect(e) then
		if Duel.SendtoGrave(tc,REASON_EFFECT)~=1 then return end
		local code=tc:GetOriginalCode()
		local ba=tc:GetBaseAttack()
		local lv=tc:GetOriginalLevel()
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
		e1:SetReset(RESET_EVENT+0x1fe0000)
		e1:SetCode(EFFECT_CHANGE_CODE)
		e1:SetValue(code)
		c:RegisterEffect(e1)
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_UPDATE_LEVEL)
		e1:SetReset(RESET_EVENT+0x1fe0000)
		e1:SetValue(lv)
		c:RegisterEffect(e1)
		c:CopyEffect(code,RESET_EVENT+0x1fe0000)
	end
end

