--ＣＮｏ．１０１Ｓ・Ｈ・Ｄａｒｋ Ｋｎｉｇｈｔ
function c80800046.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,aux.XyzFilterFunction(c,5),3)
	c:EnableReviveLimit()
	--attach
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80800046,0))
	e1:SetCategory(CATEGORY_POSITION)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1)
	e1:SetTarget(c80800046.tg)
	e1:SetOperation(c80800046.op)
	c:RegisterEffect(e1)
	--Special Summon
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80800046,1))
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON+CATEGORY_RECOVER)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e2:SetProperty(EFFECT_FLAG_DAMAGE_STEP)
	e2:SetCode(EVENT_TO_GRAVE)
	e2:SetCondition(c80800046.spcon)
	e2:SetTarget(c80800046.sptg)
	e2:SetOperation(c80800046.spop)
	c:RegisterEffect(e2)
end

function c80800046.filter(c)
	return bit.band(c:GetSummonType(),SUMMON_TYPE_SPECIAL)~=0 and not c:IsType(TYPE_TOKEN)
end
function c80800046.tg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(1-tp) and chkc:IsLocation(LOCATION_MZONE) and c80800046.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c80800046.filter,tp,0,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TARGET)
	local g=Duel.SelectTarget(tp,c80800046.filter,tp,0,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_POSITION,g,1,0,0)
end
function c80800046.op(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) and tc:IsRelateToEffect(e) then
		local tg=Group.FromCards(tc)
		local mg=tc:GetOverlayGroup()
		if mg:GetCount()>0 then
			Duel.SendtoGrave(mg,REASON_RULE)
		end
		c:SetMaterial(tg)
		Duel.Overlay(c,tg)
	end
end

function c80800046.spcon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():IsReason(REASON_DESTROY) and e:GetHandler():GetOverlayCount()>0
end
function c80800046.rfilter(c)
	return c:IsSetCard(0x85) and c:IsType(TYPE_MONSTER) and c:IsAbleToRemoveAsCost()
end
function c80800046.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsRelateToEffect(e) and Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,false,false)
		and Duel.IsExistingMatchingCard(Card.IsCode,tp,LOCATION_GRAVE,0,1,nil,80800047)
	end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,e:GetHandler(),1,0,0)
end
function c80800046.spop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if not Duel.IsExistingMatchingCard(Card.IsCode,tp,LOCATION_GRAVE,0,1,nil,80800047) then return end
	if c:IsRelateToEffect(e) and Duel.SpecialSummon(c,0,tp,tp,false,false,POS_FACEUP)>0 then
		Duel.BreakEffect()
		Duel.Recover(tp,c:GetTextAttack(),REASON_EFFECT)
		
		local e1=Effect.CreateEffect(c)
		e1:SetDescription(aux.Stringid(80800047,1))
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
		e1:SetCode(EFFECT_CANNOT_ATTACK)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
		c:RegisterEffect(e1)
	end
end