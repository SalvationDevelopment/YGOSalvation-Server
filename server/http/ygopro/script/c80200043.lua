--ＣＮｏ．１０３　神葬零嬢ラグナ・インフィニティ
function c80200043.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,aux.XyzFilterFunction(c,5),3)
	c:EnableReviveLimit()
	--attack up
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DAMAGE+CATEGORY_REMOVE)
	e1:SetDescription(aux.Stringid(80200043,0))
	e1:SetType(EFFECT_TYPE_QUICK_O)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCountLimit(1)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCost(c80200043.cost)
	e1:SetTarget(c80200043.target)
	e1:SetOperation(c80200043.operation)
	c:RegisterEffect(e1)
	--spsummon
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80200043,1))
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e2:SetProperty(EFFECT_FLAG_DAMAGE_STEP)
	e2:SetCode(EVENT_TO_GRAVE)
	e2:SetCondition(c80200043.spcon)
	e2:SetTarget(c80200043.sptg)
	e2:SetOperation(c80200043.spop)
	c:RegisterEffect(e2)
end
c80200043.rankdown=80200042

function c80200043.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
end
function c80200043.filter(c)
	return c:IsFaceup() and c:GetAttack()~=c:GetBaseAttack()
end
function c80200043.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsControler(1-tp) and c80200043.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c80200043.filter,tp,0,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	local g=Duel.SelectTarget(tp,c80200043.filter,tp,0,LOCATION_MZONE,1,1,nil)
	local tc=g:GetFirst()
	local atk=tc:GetAttack()
	local batk=tc:GetBaseAttack()
	Duel.SetOperationInfo(0,CATEGORY_DAMAGE,nil,0,1-tp,(batk>atk) and (batk-atk) or (atk-batk))
end
function c80200043.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) and tc:IsFaceup() then
		local atk=tc:GetAttack()
		local batk=tc:GetBaseAttack()
		if batk~=atk then
			local dif=(batk>atk) and (batk-atk) or (atk-batk)
			if Duel.Damage(1-tp,dif,REASON_EFFECT)>0 then
				Duel.Remove(tc,POS_FACEUP,REASON_EFFECT)
			end
		end
	end
end
function c80200043.spcon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():IsReason(REASON_DESTROY) and e:GetHandler():GetOverlayCount()>0
end
function c80200043.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,false,false)
		and Duel.IsExistingMatchingCard(Card.IsCode,tp,LOCATION_GRAVE,0,1,nil,80200042) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,e:GetHandler(),1,0,0)
end
function c80200043.spop(e,tp,eg,ep,ev,re,r,rp)
	if not Duel.IsExistingMatchingCard(Card.IsCode,tp,LOCATION_GRAVE,0,1,nil,80200042) then return end
	local c=e:GetHandler()
	if c:IsRelateToEffect(e)  then
		Duel.SpecialSummon(c,0,tp,tp,false,false,POS_FACEUP)
	end
end